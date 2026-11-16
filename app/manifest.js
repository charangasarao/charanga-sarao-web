export default function manifest() {
  return {
    name: "Charanga Sarao",
    short_name: "Sarao",
    description: "Calendario y organización de Charanga Sarao",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/PEGATINAS.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
  };
}
