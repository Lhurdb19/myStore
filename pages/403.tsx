export default function Forbidden() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl">Access Denied – You don’t have permission to view this page.</p>
    </div>
  );
}