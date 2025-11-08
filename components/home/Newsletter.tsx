export default function Newsletter() {
  return (
    <section className="px-8 py-16 bg-blue-600 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">📩 Join Our Newsletter</h2>
      <p className="mb-6">Stay updated with the latest deals and product drops.</p>
      <form className="flex justify-center gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-2 rounded-lg w-80 border-none focus:ring-2 focus:ring-white"
        />
        <button type="submit" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium">
          Subscribe
        </button>
      </form>
    </section>
  );
}
