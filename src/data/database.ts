export interface Singular {
  id: string;
  pokemon: string;
  juegoOptimo: string;
  metodoRequerido: string;
  restriccionesActivacion: string;
  shinyStatus: "Libre" | "Bloqueado" | "Especial";
}

export interface Cinta {
  id: string;
  nombre: string;
  generacion: string;
  juegoObtencion: string;
  metodo: string;
  tituloOtorgado: string;
}

export interface Legendario {
  id: string;
  generacion: string;
  juego: string;
  pokemonDisponible: string;
  shinyStatus: "Libre" | "Bloqueado";
  metodoObservaciones: string;
}

export interface Exclusivo {
  id: string;
  categoria: string;
  especieObjeto: string;
  metodoLegalidad: string;
  estadoHome: string;
  isCritical: boolean;
}

export interface RescueDatabase {
  singulares: Singular[];
  cintas: Cinta[];
  legendarios: Legendario[];
  exclusivos: Exclusivo[];
}

export const database: RescueDatabase = {
  singulares: [
    {
      id: "sing-mew",
      pokemon: "Mew",
      juegoOptimo: "Pokémon Esmeralda (GBA)",
      metodoRequerido: "Isla Suprema mediante Mapa Viejo (Runaway Encounter / Soft Reset)",
      restriccionesActivacion:
        "Evento exclusivo japonés de 2005; requiere inyección de evento o Pomeg Glitch en cartucho original.",
      shinyStatus: "Especial",
    },
    {
      id: "sing-celebi",
      pokemon: "Celebi",
      juegoOptimo: "Pokémon Cristal (Consola Virtual 3DS)",
      metodoRequerido: "Encinar con Bola GS tras vencer a la Liga Pokémon (Soft Reset 1/8192)",
      restriccionesActivacion:
        "Requiere consola 3DS con Pokémon Cristal y Poké Trasladador ya instalados antes del cierre.",
      shinyStatus: "Libre",
    },
    {
      id: "sing-jirachi",
      pokemon: "Jirachi",
      juegoOptimo: "Pokémon Channel (PAL) / Disco Bonus Colosseum (NTSC)",
      metodoRequerido: "Transferencia directa a Rubí/Zafiro con comprobación de PID",
      restriccionesActivacion:
        "Shiny hunt extremadamente largo; requiere hardware GameCube + cable GBA-GC y RNG o reinicios.",
      shinyStatus: "Especial",
    },
    {
      id: "sing-deoxys",
      pokemon: "Deoxys",
      juegoOptimo: "Pokémon Esmeralda / Rojo Fuego / Verde Hoja",
      metodoRequerido: "Isla Origen con Ori-Ticket (Runaway o Soft Reset)",
      restriccionesActivacion:
        "En Rubí Omega / Zafiro Alfa (Episodio Delta) tiene Shiny-Lock; solo es huntable legalmente en Gen 3.",
      shinyStatus: "Libre",
    },
    {
      id: "sing-arceus-platino",
      pokemon: "Arceus (Platino)",
      juegoOptimo: "Pokémon Platino (NDS)",
      metodoRequerido: "Sala del Origen mediante Flauta Azur",
      restriccionesActivacion:
        "La Flauta Azur nunca fue distribuida oficialmente en Gen 4; Poké Trasladador rechaza Arceus de Sala del Origen si no cumple filtros.",
      shinyStatus: "Bloqueado",
    },
    {
      id: "sing-victini",
      pokemon: "Victini",
      juegoOptimo: "Pokémon Blanco / Negro (NDS)",
      metodoRequerido: "Isla Libertad mediante Ticket Libertad",
      restriccionesActivacion:
        "Bloqueo rígido de variocolor (Shiny-Lock) en el código del juego durante Gen 5; imposible obtenerlo Shiny legal.",
      shinyStatus: "Bloqueado",
    },
  ],
  cintas: [
    {
      id: "cinta-campeon-hoenn",
      nombre: "Cinta de Campeón de Hoenn",
      generacion: "Gen 3",
      juegoObtencion: "Rubí / Zafiro / Esmeralda",
      metodo: "Derrotar al Alto Mando y al Campeón Máximo o Plubio con el Pokémon en el equipo.",
      tituloOtorgado: "el Campeón",
    },
    {
      id: "cinta-tierra-colosseum",
      nombre: "Cinta de la Tierra",
      generacion: "Gen 3",
      juegoObtencion: "Pokémon Colosseum / XD: Tempestad Oscura",
      metodo: "Superar las 100 batallas consecutivas del Monte Batalla sin cambiar el equipo.",
      tituloOtorgado: "el Conquistador de los 100",
    },
    {
      id: "cinta-artista-hoenn",
      nombre: "Cinta de Artista",
      generacion: "Gen 3",
      juegoObtencion: "Rubí / Zafiro / Esmeralda",
      metodo: "Ganar un Concurso Pokémon en Rango Experto con una puntuación sobresaliente.",
      tituloOtorgado: "el Modelo",
    },
    {
      id: "cinta-campeon-sinnoh",
      nombre: "Cinta de Campeón de Sinnoh",
      generacion: "Gen 4",
      juegoObtencion: "Diamante / Perla / Platino",
      metodo: "Entrar en el Hall de la Fama venciendo a Cintia en la Liga Pokémon de Sinnoh.",
      tituloOtorgado: "el Campeón de Sinnoh",
    },
    {
      id: "cinta-leyenda-hgss",
      nombre: "Cinta de Leyenda",
      generacion: "Gen 4",
      juegoObtencion: "HeartGold / SoulSilver",
      metodo: "Derrotar al Entrenador Rojo en la cima del Monte Plateado.",
      tituloOtorgado: "la Leyenda Viva",
    },
    {
      id: "cinta-real-magnifica",
      nombre: "Cinta Real Magnífica",
      generacion: "Gen 4",
      juegoObtencion: "Platino / HeartGold / SoulSilver",
      metodo: "Comprar por 999.999 Pokécuartos en el Sindicato de Cintas del Área Descanso.",
      tituloOtorgado: "el Magnífico",
    },
    {
      id: "cinta-campeon-kalos",
      nombre: "Cinta de Campeón de Kalos",
      generacion: "Gen 6",
      juegoObtencion: "Pokémon X / Y",
      metodo: "Derrotar a la Campeona Dianta en la Liga Pokémon de Kalos.",
      tituloOtorgado: "el Campeón de Kalos",
    },
    {
      id: "cinta-campeon-oras",
      nombre: "Cinta de Campeón de Hoenn (3DS)",
      generacion: "Gen 6",
      juegoObtencion: "Rubí Omega / Zafiro Alfa",
      metodo: "Vencer a la Liga de Hoenn renovada (requisito distinto a la cinta de GBA).",
      tituloOtorgado: "el Campeón de Hoenn",
    },
    {
      id: "cinta-estrella-concurso",
      nombre: "Cinta Estrella de Concurso",
      generacion: "Gen 6",
      juegoObtencion: "Rubí Omega / Zafiro Alfa",
      metodo: "Ganar las 5 categorías de Gran Concurso en Nivel Experto (Carisma, Belleza, Dulzura, Ingenio y Dureza).",
      tituloOtorgado: "la Estrella de Concurso",
    },
    {
      id: "cinta-campeon-alola",
      nombre: "Cinta de Campeón de Alola",
      generacion: "Gen 7",
      juegoObtencion: "Sol / Luna / Ultrasol / Ultraluna",
      metodo: "Defender el título en la Liga Pokémon del Monte Lanakila.",
      tituloOtorgado: "el Campeón de Alola",
    },
    {
      id: "cinta-arbol-batalla-maestro",
      nombre: "Cinta Maestro del Árbol de Combate",
      generacion: "Gen 7",
      juegoObtencion: "Sol / Luna / Ultrasol / Ultraluna",
      metodo: "Vencer a Rojo o Azul en el combate 50 de Súper Combates del Árbol de Combate.",
      tituloOtorgado: "el Maestro del Árbol",
    },
    {
      id: "cinta-batalla-royal",
      nombre: "Cinta Maestro de Battle Royal",
      generacion: "Gen 7",
      juegoObtencion: "Sol / Luna / Ultrasol / Ultraluna",
      metodo: "Ganar un combate Battle Royal en rango Maestro en el Estadio Royal de Avenida Royal.",
      tituloOtorgado: "el Maestro Royal",
    },
  ],
  legendarios: [
    {
      id: "leg-kyogre-gen3",
      generacion: "Gen 3",
      juego: "Pokémon Esmeralda / Zafiro",
      pokemonDisponible: "Kyogre, Groudon y Rayquaza",
      shinyStatus: "Libre",
      metodoObservaciones:
        "En Esmeralda usar Runaway (huir y reentrar) por el bug del RNG fijo; en Rubí/Zafiro basta Soft Reset con pila interna activa.",
    },
    {
      id: "leg-giratina-gen4",
      generacion: "Gen 4",
      juego: "Pokémon Platino",
      pokemonDisponible: "Giratina (Mundo Distorsión), Dialga y Palkia",
      shinyStatus: "Libre",
      metodoObservaciones:
        "Probabilidad base 1/8192 mediante Soft Reset frente al encuentro estático en Columna Lanza o Mundo Distorsión.",
    },
    {
      id: "leg-reshiram-gen5",
      generacion: "Gen 5",
      juego: "Pokémon Blanco / Negro",
      pokemonDisponible: "Reshiram y Zekrom (Palacio de N)",
      shinyStatus: "Bloqueado",
      metodoObservaciones:
        "Shiny-Lock estricto en Teselia tanto en el Palacio de N como en la Torre Duodraco. Solo huntables desde Gen 6 (ORAS).",
    },
    {
      id: "leg-xerneas-gen6",
      generacion: "Gen 6",
      juego: "Pokémon X / Y",
      pokemonDisponible: "Xerneas, Yveltal y Zygarde",
      shinyStatus: "Bloqueado",
      metodoObservaciones:
        "Todos los encuentros legendarios principales de Kalos (incluido Mewtwo y las aves errantes) poseen Shiny-Lock en X/Y.",
    },
    {
      id: "leg-espejismo-oras",
      generacion: "Gen 6",
      juego: "Rubí Omega / Zafiro Alfa",
      pokemonDisponible: "Ho-Oh, Lugia, Reshiram, Zekrom, Trío del Lago y Espadachines Místicos",
      shinyStatus: "Libre",
      metodoObservaciones:
        "Primeros juegos donde Reshiram y Zekrom dejan de estar bloqueados. Compatible con Amuleto Iris (1/1365).",
    },
    {
      id: "leg-poipole-usum",
      generacion: "Gen 7",
      juego: "Ultrasol / Ultraluna",
      pokemonDisponible: "Poipole, Blacephalon, Stakataka y Ultraentes",
      shinyStatus: "Libre",
      metodoObservaciones:
        "Poipole entregado por la Unidad Ultra en Ultrópolis no está afectado por Amuleto Iris (1/4096 fijo). Ideal asegurarlo antes del cierre.",
    },
  ],
  exclusivos: [
    {
      id: "exc-pichu-picoreja",
      categoria: "Forma Exclusiva de Generación",
      especieObjeto: "Pichu Picoreja (Spiky-eared Pichu)",
      metodoLegalidad: "Evento de Pichu Color Pikachu en el Encinar (HeartGold / SoulSilver)",
      estadoHome: "Bloqueado permanentemente en Gen 4. No puede transferirse al Poké Trasladador ni a Pokémon Bank.",
      isCritical: true,
    },
    {
      id: "exc-pikachu-coqueta",
      categoria: "Forma Exclusiva de Juego",
      especieObjeto: "Pikachu Coqueta (Cosplay Pikachu)",
      metodoLegalidad: "Entregada tras el primer concurso en Ciudad Portual (Rubí Omega / Zafiro Alfa)",
      estadoHome: "Inamovible: Pokémon Bank bloquea su depósito. Solo permanece viva en cartuchos/consolas ORAS.",
      isCritical: true,
    },
    {
      id: "exc-spinda-glitcheado",
      categoria: "Error Crítico de Transferencia",
      especieObjeto: "Spinda (Inversión de PID / Patrón de Manchas)",
      metodoLegalidad: "Captura salvaje o crianza en Gen 3–7 vs. Diamante Brillante / Perla Reluciente",
      estadoHome:
        "Cuarentena en HOME: los Spinda de BDSP tienen invertida la fórmula de manchas y están bloqueados para entrar/salir hacia HOME; conserva tus Spinda de Bank en Gen 7.",
      isCritical: true,
    },
    {
      id: "exc-ash-greninja",
      categoria: "Habilidad Única (Fuerte Afecto)",
      especieObjeto: "Greninja de Ash",
      metodoLegalidad: "Demo Especial de Pokémon Sol y Luna transferible a la versión completa (1 por partida)",
      estadoHome: "Transferible vía Pokémon Bank a Pokémon HOME; conserva su rasgo Battle Bond aunque la Demo ya no sea descargable.",
      isCritical: false,
    },
    {
      id: "exc-vivillon-eventos",
      categoria: "Motivo de Evento Limitado",
      especieObjeto: "Vivillon Motivo Poké Ball y Motivo Fantasía",
      metodoLegalidad: "Distribuciones oficiales de Pokémon X / Y y Rubí Omega / Zafiro Alfa",
      estadoHome: "Transferible vía Pokémon Bank a Pokémon HOME; altamente prioritario rescatarlo antes del apagado definitivo.",
      isCritical: false,
    },
  ],
};
