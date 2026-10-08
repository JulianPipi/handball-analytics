import type { Player } from '../types/handball';

export interface PlayerDiagnosticReport {
  player: Player;
  overallRating: number;
  tacticalRole: string;
  strengths: { title: string; desc: string; metric: string }[];
  weaknesses: { title: string; desc: string; metric: string }[];
  trainingRecommendations: { category: string; drill: string; focus: string }[];
  developmentIndex: number; // 0 - 100
  potentialCeiling: number; // 0 - 100
}

export function generatePlayerDiagnostic(player: Player): PlayerDiagnosticReport {
  const isGK = player.position === 'GK';
  const isBack = ['LB', 'CB', 'RB'].includes(player.position);
  const isWing = ['LW', 'RW'].includes(player.position);
  const isPivot = player.position === 'PV';

  const s = player.stats;
  const shotEff = s.shots > 0 ? Math.round((s.goals / s.shots) * 100) : 0;
  const saveEff = s.shotsFaced > 0 ? Math.round((s.saves / s.shotsFaced) * 100) : 0;
  const assistToTurnover = s.turnovers > 0 ? (s.assists / s.turnovers).toFixed(1) : s.assists.toString();

  const strengths: { title: string; desc: string; metric: string }[] = [];
  const weaknesses: { title: string; desc: string; metric: string }[] = [];
  const recommendations: { category: string; drill: string; focus: string }[] = [];

  let overall = 70;

  // 1. EVALUACIÓN POR PORTEROS
  if (isGK) {
    overall = Math.round(50 + saveEff * 1.1);

    if (saveEff >= 36) {
      strengths.push({
        title: 'Muro Bajo Palos (Eficacia Élite)',
        desc: 'Porcentaje de paradas sobresaliente en la categoría, marcando diferencias en momentos clave del partido.',
        metric: `${saveEff}% de paradas (${s.saves}/${s.shotsFaced})`,
      });
    } else if (saveEff >= 30) {
      strengths.push({
        title: 'Solvencia Regular en Portería',
        desc: 'Mantiene una tasa de atajadas estable dentro de los estándares de la competición.',
        metric: `${saveEff}% de paradas`,
      });
    } else {
      weaknesses.push({
        title: 'Bajo Rendimiento en Porcentaje de Paradas',
        desc: 'Por debajo del 30% ideal de eficacia para la categoría; los rivales encuentran huecos con facilidad.',
        metric: `${saveEff}% eficacia`,
      });
      recommendations.push({
        category: 'Técnica de Portería',
        drill: 'Trabajo de reducción de ángulos en lanzamientos desde extremos y 6m.',
        focus: 'No anticipar la caída y aguantar el pie de apoyo hasta el armado del brazo.',
      });
    }

    if (s.assists >= 8) {
      strengths.push({
        title: 'Lanzador Letal de Contraataque (1ª Oleada)',
        desc: 'Excelente visión periférica tras parada para colocar balones largos a extremos a la carrera.',
        metric: `${s.assists} asistencias directas`,
      });
    } else {
      recommendations.push({
        category: 'Transición Ofensiva',
        drill: 'Pase largo de contraataque inmediatamente tras blocaje o parada con pase tenso a 20-25 metros.',
        focus: 'Elevar la cabeza inmediatamente tras recuperar el balón.',
      });
    }

    if (s.twoMinutes === 0) {
      strengths.push({
        title: 'Compostura y Disciplina Máxima',
        desc: 'No comete infracciones en salidas fuera del área ni protestas que perjudiquen al equipo.',
        metric: '0 exclusiones de 2 minutos',
      });
    } else {
      weaknesses.push({
        title: 'Riesgo en Salidas Fuera del Área',
        desc: 'Exclusiones acumuladas por contacto fuera del área en balones divididos.',
        metric: `${s.twoMinutes} exclusiones de 2'`,
      });
    }

    recommendations.push({
      category: 'Biomecánica & Reflejos',
      drill: 'Series de lanzamientos rápidos desde 9m con pantalla de pivote para mejorar visión periférica.',
      focus: 'Ajuste posicional según el armado de lanzadores diestros y zurdos.',
    });
  }

  // 2. EVALUACIÓN POR JUGADORES DE CAMPO
  else {
    // Acierto en tiro
    if (shotEff >= 70) {
      strengths.push({
        title: 'Eficacia Goleadora Sobresaliente',
        desc: 'Excelente toma de decisiones en el lanzamiento y alta efectividad en la definición.',
        metric: `${shotEff}% acierto (${s.goals}/${s.shots})`,
      });
    } else if (shotEff < 55 && s.shots >= 10) {
      weaknesses.push({
        title: 'Porcentaje de Tiro Mejorable',
        desc: 'Desperdicia ocasiones claras o fuerza lanzamientos en situaciones desfavorables.',
        metric: `${shotEff}% acierto (${s.shots - s.goals} tiros fallados)`,
      });
      recommendations.push({
        category: 'Finalización',
        drill: 'Trabajo de variabilidad de armado (rectificado, bote bajo, vaselina y cambios de altura de tiro).',
        focus: 'Observar los apoyos del portero antes de soltar la muñeca.',
      });
    }

    // Pérdidas de balón
    if (s.turnovers <= 5 && s.shots >= 15) {
      strengths.push({
        title: 'Excelente Seguridad en la Circulación',
        desc: 'Comete muy pocas pérdidas técnicas, protegiendo al equipo de contraataques rivales.',
        metric: `Solo ${s.turnovers} pérdidas`,
      });
    } else if (s.turnovers > 12) {
      weaknesses.push({
        title: 'Exceso de Pérdidas de Balón',
        desc: 'Pérdidas por pases forzados, pasos o dobles que alimentan la transición rápida rival.',
        metric: `${s.turnovers} pérdidas acumuladas`,
      });
      recommendations.push({
        category: 'Toma de Decisiones',
        drill: 'Juegos de superioridad 4vs3 y 3vs2 con límite de 2 botes para acelerar el pase seguro.',
        focus: 'Fijar al impar y descargar el balón antes del contacto físico del defensor.',
      });
    }

    // Asistencias y visión
    if (s.assists >= 25 || (isBack && s.assists >= 18)) {
      strengths.push({
        title: 'Gran Capacidad de Conexión y Asistencia',
        desc: 'Genera ventajas constantes para pivotes y extremos con pases filtrados.',
        metric: `${s.assists} asistencias (Ratio Asist/Pérdida: ${assistToTurnover})`,
      });
    }

    // Robos y defensa
    if (s.steals >= 12) {
      strengths.push({
        title: 'Actividad e Interceptación Defensiva',
        desc: 'Manos activas en primera línea defensiva para robar balones y cortar líneas de pase.',
        metric: `${s.steals} robos defensivos`,
      });
    } else if (s.steals <= 3 && !isWing) {
      weaknesses.push({
        title: 'Poca Incidencia en Recuperaciones Defensivas',
        desc: 'Falta de anticipación en las líneas de pase rivales.',
        metric: `${s.steals} robos registrados`,
      });
      recommendations.push({
        category: 'Defensa Individual',
        drill: 'Desplazamientos laterales en sistema defensivo 6:0 y 5:1 con ataque al bote del lateral.',
        focus: 'Anticipación y timing del brazo defensivo sin cometer exclusión.',
      });
    }

    // Disciplina (2 minutos)
    if (s.twoMinutes >= 5) {
      weaknesses.push({
        title: 'Propensión a Exclusiones de 2 Minutos',
        desc: 'Infracciones reiteradas por agarrones por detrás o llegar tarde a la ayuda defensiva.',
        metric: `${s.twoMinutes} exclusiones (${s.twoMinutes * 2} min en inferioridad)`,
      });
      recommendations.push({
        category: 'Control Disciplinario',
        drill: 'Fijación de apoyos en defensa frontal sin brazos al cuello ni empujones en el aire.',
        focus: 'Mover los pies para cerrar la trayectoria en lugar de sujetar con los brazos.',
      });
    } else if (s.twoMinutes <= 2) {
      strengths.push({
        title: 'Gran Disciplina Táctica',
        desc: 'Defensa limpia y concentrada que evita dejar al equipo en inferioridad numérica.',
        metric: `${s.twoMinutes} exclusiones en toda la temporada`,
      });
    }

    // Impacto +/-
    if (s.plusMinus >= 25) {
      strengths.push({
        title: 'Impacto Positivo Masivo en Pista (+/-)',
        desc: 'El equipo tiene un diferencial claramente ganador mientras este jugador está en cancha.',
        metric: `+${s.plusMinus} diferencial`,
      });
    }

    // Recomendaciones específicas por puesto
    if (isWing) {
      recommendations.push({
        category: 'Táctica de Extremos',
        drill: 'Entrenamiento de salto hacia el centro del área para ampliar el ángulo con el poste corto.',
        focus: 'Buscar la escuadra larga o amagar al palo corto para descolocar al portero.',
      });
    } else if (isPivot) {
      recommendations.push({
        category: 'Táctica de Pivote',
        drill: 'Bloqueos dinámicos en 9m y continuación rápida al espacio libre entre defensas centrales.',
        focus: 'Ganar la posición con el tren inferior y asegurar la recepción a dos manos.',
      });
    } else if (isBack) {
      recommendations.push({
        category: 'Primera Línea',
        drill: 'Lanzamiento en suspensión con oposición de bloqueador alto y rectificado de cadera.',
        focus: 'Lanzar con velocidad de brazo sin perder el equilibrio en la caída.',
      });
    }

    // Overall calculation
    overall = Math.round(
      55 +
        (shotEff > 0 ? (shotEff - 50) * 0.4 : 0) +
        s.goals * 0.15 +
        s.assists * 0.15 +
        s.steals * 0.2 -
        s.turnovers * 0.2 -
        s.twoMinutes * 0.5
    );
  }

  // Cap overall between 60 and 97
  const finalOverall = Math.max(62, Math.min(97, overall));
  const potentialCeiling = Math.min(99, finalOverall + Math.max(3, 12 - Math.floor((player.stats.twoMinutes || 0) * 0.5)));

  // Tactical Role Description
  let tacticalRole = 'Jugador de Rotación';
  if (finalOverall >= 88) tacticalRole = 'Líder / Jugador Franquicia';
  else if (finalOverall >= 80) tacticalRole = 'Titular Indiscutible';
  else if (finalOverall >= 73) tacticalRole = 'Especialista Táctico';

  // Ensure at least 2 strengths and 1 weakness for rich feedback
  if (strengths.length === 0) {
    strengths.push({
      title: 'Compromiso y Actitud Táctica',
      desc: 'Cumple con el plan de juego del entrenador y mantiene la concentración en cancha.',
      metric: 'Rendimiento sólido',
    });
  }
  if (weaknesses.length === 0) {
    weaknesses.push({
      title: 'Regularidad en Partidos de Máxima Exigencia',
      desc: 'Mantener el mismo nivel de acierto cuando el rival sube la intensidad defensiva.',
      metric: 'Margen de mejora continua',
    });
  }

  return {
    player,
    overallRating: finalOverall,
    tacticalRole,
    strengths,
    weaknesses,
    trainingRecommendations: recommendations,
    developmentIndex: finalOverall,
    potentialCeiling,
  };
}
