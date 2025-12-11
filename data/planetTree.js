export const planetTree = {
  id: "root",
  title: "TriplexSolutio",
  subtitle: "ANIME · CODE · GAMING",
  logoImage: "img/logo_.webp",
  logoText: "TS",
  type: "Brand",
  accent: "orange",
  description:
    "Explora todo mi contenido: Buscador de animes, gameplays, componentes javascript, IA...",
  // tags: ["@triplexsolutio"],
  actions: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/triplexsolutio",
      external: true,
    },
    {
      label: "Patreon (+220 Miembros)",
      href: "https://www.patreon.com/c/triplexsolutio",
      external: true,
    },
  ],
  children: [
    {
      id: "anime",
      title: "Anime",
      subtitle: "Recomendaciones, clips, noticias y más",
      logoText: "AN",
      logoImage: "img/logo_anime.webp",
      type: "Categoría",
      accent: "blue",
      description: "De un fan del anime para fans del anime :3",
      // tags: ["Anime", "Series"],
      actions: [
        {
          label: "Instagram",
          href: "https://www.instagram.com/animexsolutio",
          external: true,
        },
      ],
      children: [
        {
          id: "anime-lists",
          title: "Recomendaciones TOP",
          subtitle:
            "Listas de animes: shonen, romance, isekai, clásicos, joyas ocultas y muchas más",
          logoText: "REC",
          type: "Módulo",
          accent: "orange",
          // description:
          //   "Listas TOP: shonen, romance, isekai, clásicos y joyas ocultas.",
          // tags: ["Recomendaciones"],
        },
        {
          id: "buscador-anime",
          title: "Buscador Anime",
          subtitle:
            "Encuentra dónde ver todas las recomendaciones anime publicadas en redes y patreon",
          logoText: "?",
          type: "Módulo",
          logoImage: "img/logo_buscador.webp",
          actions: [
            {
              label: "Ir al Buscador",
              href: "/buscador-anime",
              external: false,
            },
          ],
          accent: "orange",
          // description:
          //   "Historias, easter eggs y conexiones entre anime, manga y autores.",
          // tags: ["Buscador"],
        },
        {
          id: "anime-alerts",
          title: "Noticias",

          subtitle:
            "Nunca te pierdas ninguna novedad relevante del mundo anime",
          logoText: "NEW",
          type: "Módulo",
          accent: "blue",

          // description:
          //   "Alertas automáticas cuando sale un nuevo episodio de tus series favoritas.",
        },
      ],
    },
    {
      id: "gaming",
      title: "Gaming",
      subtitle: "PRÓXIMAMENTE | Directos, Gameplays, Setups..",
      logoText: "GM",
      logoImage: "img/logo_gaming.webp",
      type: "Categoría",
      accent: "blue",
      description:
        "Streaming de videojuegos con estética anime, jugadas épicas, setups TOP y más.",
      // tags: ["Gaming"],
      children: [
        {
          id: "gaming-clips",
          title: "Clips épicos",
          logoText: "CLIP",
          type: "Módulo",
          accent: "orange",
          description: "Jugadones, momentos WTF y más clips.",
          // tags: ["Highlights"],
        },
        {
          id: "gaming-setup",
          title: "Setups & gear",
          logoText: "PC",
          type: "Módulo",
          accent: "blue",
          description:
            "Setup, periféricos y configuraciones que uso para crear y jugar.",
          // tags: ["Hardware"],
        },
      ],
    },
    {
      id: "code",
      title: "Code",
      subtitle: "PRÓXIMAMENTE | Aprende a programar como dios manda",
      logoText: "CODE",
      logoImage: "img/logo_code.webp",
      type: "Categoría",
      accent: "orange",
      description:
        "Soy programador frontend senior y te enseño a crear una web como ésta usando componentes hechos desde cero con javascript ",
      // tags: ["@codexsolutio"],
      children: [
        {
          id: "co-components",
          title: "Componentes",
          logoText: "CMP",
          type: "Módulo",
          accent: "orange",
          description: "Componentes web hechos con javascript",
          // tags: ["Arte"],
        },
        {
          id: "co-praxis",
          title: "Buenas prácticas",
          logoText: "ART",
          type: "Módulo",
          accent: "blue",
          description:
            "No hagas chapuzas, te enseño a programar como un artista",
          // tags: ["Automatización"],
        },
      ],
    },
  ],
};
