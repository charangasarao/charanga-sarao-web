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
        src: "/PEGATINAS-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/PEGATINAS-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
