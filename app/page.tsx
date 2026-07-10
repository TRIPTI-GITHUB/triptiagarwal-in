export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] flex items-center justify-center px-6">
      <section className="max-w-4xl text-center">

        <p className="uppercase tracking-[0.3em] text-sm text-[#B08D57] mb-4">
          Coming Soon
        </p>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Tripti Agarwal Heritage Lab
        </h1>

        <p className="text-xl md:text-2xl text-[#234E52] italic mb-10">
          Preserving the Past. Inspiring the Future.
        </p>

        <p className="text-lg leading-8 max-w-3xl mx-auto mb-12">
          A digital space dedicated to exploring history through
          philately, numismatics, postal heritage and storytelling.

          <br /><br />

          This platform is currently under development and will soon
          feature curated collections, award-winning exhibits,
          educational resources, workshops, podcasts and AI-powered
          heritage experiences.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-12">

          <div>🏛️ Digital Museum</div>

          <div>📮 Stamp Collections</div>

          <div>🪙 Coin Collections</div>

          <div>📚 Learning Resources</div>

          <div>🎙️ Podcast</div>

          <div>🤖 AI Heritage Tools</div>

        </div>

        <p className="text-sm text-gray-500">
          © 2026 Tripti Agarwal Heritage Lab
        </p>

      </section>
    </main>
  );
}