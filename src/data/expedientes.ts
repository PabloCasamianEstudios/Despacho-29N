import type { Expediente } from '../game/types';

export const EXPEDIENTES: Expediente[] = [
  { id: "exp-vivienda", tema: "Vivienda", opciones: [
    { partido: "pp", eje: [0.8, 0], titulo: "Un millón de casas y menos trabas",
      texto: "Construir un millón de viviendas con una nueva Ley del Suelo, licencias en tres meses con silencio positivo, y derogar la Ley de Vivienda con sus zonas tensionadas y su índice de precios.",
    claro: "Construir muchas más casas: más suelo para edificar y permisos de obra en 3 meses como máximo. Además se quitaría la ley actual que permite poner un tope al precio del alquiler en las zonas más caras." },
    { partido: "psoe", eje: [-0.6, 0], titulo: "El 1 % del PIB para vivienda",
      texto: "Dedicar cada año el 1 % del PIB a vivienda, crear un parque público estatal de 100.000 pisos y congelar por un tiempo los alquileres que superen el índice en zonas tensionadas.",
    claro: "Gastar cada año en vivienda el 1 % de todo lo que produce el país (unos 16.000 millones), crear 100.000 pisos públicos y congelar los alquileres que pasen del precio de referencia en las zonas más caras." },
    { partido: "vox", eje: [0.6, 0.5], titulo: "IVA cero y desalojo en 24 horas",
      texto: "Derogar la Ley de Vivienda, IVA del 0 % en la primera vivienda nueva de familias españolas, exigir residencia legal para alquilar y desalojar a okupas en menos de 24 horas.",
    claro: "Quitar la ley actual de vivienda, que una familia española no pague IVA al comprar su primera casa nueva, que solo pueda alquilar quien está legalmente en España y echar a los okupas en menos de un día." },
    { partido: "fa", eje: [-1, 0.2], titulo: "Millón y medio de pisos públicos",
      texto: "1,5 millones de viviendas públicas en 12 años, alquileres topados al 25 % de la renta de la zona, un impuesto del 10 % del valor a quien acumule viviendas y expropiar por fases a los grandes propietarios corporativos.",
    claro: "Que el Estado construya o compre 1,5 millones de pisos públicos, que el alquiler no pase del 25 % de lo que ganan de media los hogares del barrio y que pague mucho impuesto quien acumula viviendas, llegando a expropiar a las grandes empresas." }
  ]},
  { id: "exp-impuestos", tema: "Impuestos", opciones: [
    { partido: "pp", eje: [0.6, 0], titulo: "Que el sueldo mínimo no pague IRPF",
      texto: "Quien cobre el salario mínimo no pagará IRPF; los menores de 35 tendrán el IRPF rebajado un 100, 75, 50 y 25 % sus cuatro primeros años, e IVA del 0 % en alimentos básicos.",
    claro: "Bajar impuestos a quien trabaja: quien cobra el sueldo mínimo no pagaría el impuesto sobre la renta, los menores de 35 pagarían mucho menos en sus primeros años de trabajo y los alimentos básicos no tendrían IVA." },
    { partido: "psoe", eje: [-0.7, 0], titulo: "Más impuestos al capital alto",
      texto: "Las rentas del capital de más de 300.000 € tributarán hasta el 35 %, la tasa a las transacciones financieras subirá del 0,2 % al 0,4 % y pagarán más las empresas cuyo jefe gane 100 veces lo de su plantilla.",
    claro: "Subir impuestos a quien gana mucho dinero con inversiones (más de 300.000 € al año), doblar el impuesto a la compraventa de acciones y cobrar más a las empresas cuyo jefe cobra más de 100 veces lo que su empleado medio." },
    { partido: "vox", eje: [0.9, 0], titulo: "Bajada general de impuestos",
      texto: "Bajar el IRPF (menos cuantos más hijos), el IVA y el Impuesto de Sociedades, gravar el dinero enviado al extranjero y retirar poco a poco las subvenciones a partidos, sindicatos, patronal y ONG.",
    claro: "Bajar los grandes impuestos (el de la renta, el IVA y el de las empresas), cobrar un impuesto a quien envía dinero al extranjero y dejar de dar dinero público a partidos, sindicatos, patronal y ONG." },
    { partido: "fa", eje: [-1, 0], titulo: "Que paguen las grandes fortunas",
      texto: "Impuesto anual del 2 % a patrimonios de más de 1 millón (3 % desde 50 millones), un tipo mínimo efectivo del 15 % para las grandes empresas y un impuesto estatal a las herencias de más de un millón.",
    claro: "Un impuesto cada año a quien tiene más de un millón de euros en patrimonio, obligar a las grandes empresas a pagar al menos el 15 % de sus beneficios y un impuesto a las herencias de más de un millón." }
  ]},
  { id: "exp-inmigracion", tema: "Inmigración", opciones: [
    { partido: "pp", eje: [0, 0.5], titulo: "Cupos y visados por puntos",
      texto: "Prohibir las regularizaciones masivas, fijar cupos anuales de trabajadores por sectores, visados por puntos e identificar en siete días a quien entre de forma irregular para devolverlo.",
    claro: "Que entren trabajadores extranjeros según los empleos que falten, eligiéndolos por puntos (estudios, idioma…). Quien entre de forma irregular sería identificado en una semana y devuelto. Nada de regularizar a mucha gente de golpe." },
    { partido: "psoe", eje: [0, -0.5], titulo: "Vías legales y plan de integración",
      texto: "Ampliar las vías legales y seguras de entrada, los visados humanitarios y la acogida, con un Plan de Integración y Ciudadanía 2026-2030 dotado con 500 M€.",
    claro: "Más formas legales y seguras de llegar a España, sobre todo para quien huye de guerras o persecuciones (asilo), y 500 millones de euros para ayudar a los inmigrantes a integrarse." },
    { partido: "vox", eje: [0, 1], titulo: "Repatriaciones y prioridad nacional",
      texto: "Suprimir el arraigo, repatriar a quien esté en situación irregular, un plan de retorno para los extranjeros que no contribuyan o vivan de subsidios, prioridad a los españoles en ayudas y vivienda pública, y militarizar la frontera de Ceuta.",
    claro: "Cerrar las vías para regularizar a quien está sin papeles, devolver a su país a quien esté en situación irregular o viva de ayudas, y que los españoles tengan preferencia en ayudas, pisos públicos o guarderías." },
    { partido: "fa", eje: [0, -0.9], titulo: "Regularización permanente",
      texto: "Reformar la Ley de Extranjería para crear un procedimiento estable y permanente de regularización, terminar la regularización extraordinaria de 2026 y facilitar el padrón, la cuenta bancaria y la homologación de títulos.",
    claro: "Que un inmigrante sin papeles que cumpla los requisitos pueda regularizarse en cualquier momento, no solo en procesos excepcionales, y quitar trabas para empadronarse o abrir una cuenta en el banco." }
  ]},
  { id: "exp-energia", tema: "Energía", opciones: [
    { partido: "pp", eje: [0.5, 0], titulo: "Alargar la vida de las nucleares",
      texto: "Anular el calendario de cierre de las nucleares y alargar su vida si lo aprueba el Consejo de Seguridad Nuclear, suprimir el impuesto del 7 % a la producción eléctrica y crear una tarifa social única.",
    claro: "No cerrar las centrales nucleares, que ahora tienen fecha de cierre entre 2027 y 2035, si el organismo de seguridad nuclear da el visto bueno. Y quitar un impuesto que encarece la luz." },
    { partido: "psoe", eje: [-0.3, 0.2], titulo: "81 % renovable en 2030",
      texto: "Llegar a un 81 % de electricidad renovable en 2030, mantener el cierre nuclear hasta 2035 con ayudas a las comarcas afectadas y abandonar poco a poco los combustibles fósiles.",
    claro: "Que en 2030 el 81 % de la electricidad salga del sol, el viento o el agua, y cerrar las nucleares poco a poco hasta 2035, como ya está previsto." },
    { partido: "vox", eje: [0.7, -0.2], titulo: "Nucleares nuevas y menos normas verdes",
      texto: "Recuperar el plan nuclear y estudiar nuevas centrales junto a las actuales, revertir el Pacto Verde Europeo (incluida la prohibición de coches de combustión) y bajar los impuestos de la luz.",
    claro: "No cerrar las nucleares e incluso estudiar construir más, quitar normas europeas contra el cambio climático (como la prohibición de vender coches de gasolina y diésel nuevos en 2035) y bajar los impuestos de la luz." },
    { partido: "fa", eje: [-0.9, 0], titulo: "Una eléctrica pública",
      texto: "Un fondo soberano de renovables, una comercializadora eléctrica pública y tres horas de luz gratis al día para todos los hogares, en las horas de más producción solar.",
    claro: "Que el Estado entre en el negocio de la energía: una compañía eléctrica pública que te venda la luz, y luz gratis para todos tres horas al día, en las horas de más sol." }
  ]},
  { id: "exp-familia", tema: "Familia", opciones: [
    { partido: "pp", eje: [-0.1, 0.1], titulo: "Guardería gratis de 0 a 3",
      texto: "Escuela infantil de 0 a 3 años gratuita al acabar la legislatura, pagando el Estado la mitad de cada plaza, todas las deducciones familiares en una ayuda mensual reembolsable y permisos de nacimiento más largos.",
    claro: "Guardería gratis de 0 a 3 años, juntar todas las ayudas por hijos en un pago cada mes (aunque no pagues impuestos) y permisos más largos cuando nace un hijo." },
    { partido: "psoe", eje: [-0.5, 0], titulo: "1.000 € al nacer",
      texto: "Una «Cuenta de Futuro» de 1.000 € al nacer invertida en fondos públicos hasta los 18, deducción por hijo cobrable aunque no se pague IRPF y cuatro semanas de permiso parental pagado al 100 %.",
    claro: "Cada bebé recibiría al nacer 1.000 € invertidos que podría usar al cumplir 18. Las familias cobrarían la ayuda por hijo aunque no paguen impuestos, y habría 4 semanas más de permiso pagado para cuidar a los hijos." },
    { partido: "vox", eje: [0, 0.4], titulo: "Familia numerosa desde el primer hijo",
      texto: "Ventajas de familia numerosa desde el primer hijo, el Estado paga la cotización de quien deje de trabajar para cuidar a sus hijos y un IRPF más bajo cuantos más hijos.",
    claro: "Las ventajas que hoy tienen las familias numerosas (descuentos, ayudas) se darían desde el primer hijo. El Estado pagaría la Seguridad Social de quien deje de trabajar para criar, y menos impuestos cuantos más hijos." },
    { partido: "fa", eje: [-0.8, 0], titulo: "200 € al mes por cada menor",
      texto: "Una prestación universal de 200 € al mes por cada menor de 18 años, sin mirar los ingresos de la familia, como derecho del propio niño.",
    claro: "Todas las familias cobrarían 200 € al mes por cada hijo menor de 18 años, sean ricas o pobres. El dinero sería un derecho del propio niño." }
  ]},
  { id: "exp-trabajo", tema: "Trabajo", opciones: [
    { partido: "pp", eje: [0.7, 0], titulo: "Respiro para los autónomos",
      texto: "Los autónomos que facturen menos de 85.000 € no cobrarán ni declararán IVA, no pagarán cuota el primer año y no pagarán cotización por su primer empleado durante un año.",
    claro: "Menos papeleo y menos pagos para los autónomos pequeños: no tendrían que cobrar ni declarar IVA, no pagarían cuota el primer año y contratar a su primer empleado les saldría mucho más barato." },
    { partido: "psoe", eje: [-0.6, 0], titulo: "37,5 horas y salario mínimo blindado",
      texto: "Jornada de 37,5 horas sin bajar el sueldo, avanzar hacia las 35 horas por convenio y fijar por ley el salario mínimo por encima del 60 % del salario medio.",
    claro: "Trabajar 37,5 horas a la semana en vez de 40 cobrando lo mismo, intentar llegar a 35 negociando con las empresas, y que el salario mínimo nunca baje del 60 % del sueldo medio." },
    { partido: "vox", eje: [0.8, 0], titulo: "Derogar las leyes laborales actuales",
      texto: "Derogar la legislación laboral del actual Gobierno y que los autónomos que ganen menos del salario mínimo paguen 0 € de cuota (desde 50 € por encima).",
    claro: "Quitar las leyes laborales aprobadas por este Gobierno, como la reforma laboral de 2021, y que los autónomos que ganan menos que el salario mínimo no paguen cuota." },
    { partido: "fa", eje: [-1, 0], titulo: "Semana de 32 horas",
      texto: "Reducir por ley la jornada a 32 horas semanales sin bajar el sueldo, empezando ya por las 37,5, y un salario mínimo fijado por ley en el 60 % del salario medio neto.",
    claro: "Bajar poco a poco la semana laboral hasta 32 horas (cuatro días) cobrando lo mismo, empezando ya por las 37,5, y subir el salario mínimo." }
  ]}
];
