export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 text-center">
      <p className="mb-1 text-sm">
        PokéCloud © {new Date().getFullYear()} — Built with ❤️ by Marquan Bowman
      </p>
      <p className="text-xs text-gray-500">
        Data from{" "}
        <a
          href="https://pokeapi.co"
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:underline"
        >
          PokéAPI
        </a>
      </p>
    </footer>
  );
}
