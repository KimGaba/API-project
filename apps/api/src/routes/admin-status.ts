import type { FastifyInstance } from 'fastify';
import { query } from '../lib/db.js';

type SourceSummaryRow = {
  source_code: string;
  source_name: string;
  country_code: string;
  status: string;
  license_tag: string;
  access_method: string;
  commercial_reuse_allowed: boolean;
  update_cadence: string | null;
  companies_count: string;
  source_records_count: string;
  ingestion_runs_count: string;
  last_run_status: string | null;
  last_run_started_at: string | null;
  last_run_completed_at: string | null;
  last_records_seen: number | null;
  last_records_written: number | null;
  last_records_failed: number | null;
};

type RunSummaryRow = {
  id: string;
  source_code: string;
  source_name: string;
  country_code: string;
  run_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  records_seen: number;
  records_written: number;
  records_failed: number;
  checkpoint: string | null;
  error_message: string | null;
};

function buildNotes(sourceRows: SourceSummaryRow[], runRows: RunSummaryRow[]) {
  const notes: string[] = [];
  const activeSources = sourceRows.filter((row) => row.status === 'active').length;
  const successfulRuns = runRows.filter((row) => row.status === 'succeeded').length;
  const failedRuns = runRows.filter((row) => row.status === 'failed').length;
  const runningRuns = runRows.filter((row) => row.status === 'running').length;
  const writtenRecords = runRows.reduce((sum, row) => sum + row.records_written, 0);

  notes.push(`${sourceRows.length} source registry entries found, ${activeSources} marked active.`);

  if (runRows.length === 0) {
    notes.push('No ingestion runs recorded yet. Run a worker to populate latest-run visibility.');
  } else {
    notes.push(`${runRows.length} recent runs loaded: ${successfulRuns} succeeded, ${failedRuns} failed, ${runningRuns} currently running.`);
    notes.push(`Recent runs wrote ${writtenRecords} records in total.`);
  }

  const staleSources = sourceRows
    .filter((row) => !row.last_run_started_at)
    .map((row) => row.source_code);

  if (staleSources.length > 0) {
    notes.push(`No recorded ingestion run yet for: ${staleSources.join(', ')}.`);
  }

  return notes;
}

export async function adminStatusRoutes(app: FastifyInstance) {
  app.get('/v1/admin/status', async () => {
    const [sourcesResult, runsResult] = await Promise.all([
      query<SourceSummaryRow>(`
        SELECT
          sr.source_code,
          sr.source_name,
          sr.country_code,
          sr.status,
          sr.license_tag,
          sr.access_method,
          sr.commercial_reuse_allowed,
          sr.update_cadence,
          (SELECT COUNT(*) FROM companies c WHERE c.latest_source_id = sr.id)::text AS companies_count,
          (SELECT COUNT(*) FROM source_records rec WHERE rec.source_id = sr.id)::text AS source_records_count,
          (SELECT COUNT(*) FROM ingestion_runs ir WHERE ir.source_id = sr.id)::text AS ingestion_runs_count,
          latest.status AS last_run_status,
          latest.started_at AS last_run_started_at,
          latest.completed_at AS last_run_completed_at,
          latest.records_seen AS last_records_seen,
          latest.records_written AS last_records_written,
          latest.records_failed AS last_records_failed
        FROM source_registry sr
        LEFT JOIN LATERAL (
          SELECT
            ir2.status,
            ir2.started_at,
            ir2.completed_at,
            ir2.records_seen,
            ir2.records_written,
            ir2.records_failed
          FROM ingestion_runs ir2
          WHERE ir2.source_id = sr.id
          ORDER BY COALESCE(ir2.started_at, ir2.created_at) DESC, ir2.created_at DESC
          LIMIT 1
        ) latest ON TRUE
        ORDER BY sr.country_code ASC, sr.source_code ASC
      `),
      query<RunSummaryRow>(`
        SELECT
          ir.id,
          sr.source_code,
          sr.source_name,
          sr.country_code,
          ir.run_type,
          ir.status,
          ir.started_at,
          ir.completed_at,
          ir.records_seen,
          ir.records_written,
          ir.records_failed,
          ir.checkpoint,
          ir.error_message
        FROM ingestion_runs ir
        INNER JOIN source_registry sr ON sr.id = ir.source_id
        ORDER BY COALESCE(ir.started_at, ir.created_at) DESC, ir.created_at DESC
        LIMIT 10
      `)
    ]);

    const sourceSummaries = sourcesResult.rows.map((row) => ({
      sourceCode: row.source_code,
      sourceName: row.source_name,
      countryCode: row.country_code,
      status: row.status,
      licenseTag: row.license_tag,
      accessMethod: row.access_method,
      commercialReuseAllowed: row.commercial_reuse_allowed,
      updateCadence: row.update_cadence,
      companiesCount: Number(row.companies_count),
      sourceRecordsCount: Number(row.source_records_count),
      ingestionRunsCount: Number(row.ingestion_runs_count),
      latestRun: row.last_run_status
        ? {
            status: row.last_run_status,
            startedAt: row.last_run_started_at,
            completedAt: row.last_run_completed_at,
            recordsSeen: row.last_records_seen ?? 0,
            recordsWritten: row.last_records_written ?? 0,
            recordsFailed: row.last_records_failed ?? 0
          }
        : null
    }));

    const recentRuns = runsResult.rows.map((row) => ({
      id: row.id,
      sourceCode: row.source_code,
      sourceName: row.source_name,
      countryCode: row.country_code,
      runType: row.run_type,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      recordsSeen: row.records_seen,
      recordsWritten: row.records_written,
      recordsFailed: row.records_failed,
      checkpoint: row.checkpoint,
      errorMessage: row.error_message
    }));

    return {
      data: {
        sourceSummaries,
        recentRuns,
        notes: buildNotes(sourcesResult.rows, runsResult.rows)
      },
      meta: {
        generatedAt: new Date().toISOString(),
        totalSources: sourceSummaries.length,
        totalRecentRuns: recentRuns.length
      }
    };
  });
}
