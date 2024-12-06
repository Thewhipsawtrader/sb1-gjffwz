import { ArchiveViewer } from '../components/ArchiveViewer';

export function ArchivePage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Report Archive</h1>
        <p className="mt-1 text-sm text-gray-600">
          Access and review historical error reports for compliance and auditing.
        </p>

        <div className="mt-6">
          <ArchiveViewer />
        </div>
      </div>
    </div>
  );
}