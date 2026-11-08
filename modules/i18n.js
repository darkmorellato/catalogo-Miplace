// ============================================================
// MIPLACE GROUP — i18n.js
// Camada corporativa PT / EN / ES (produtos permanecem em PT-BR)
// @ts-check
// ============================================================

(() => {
    'use strict';

    const STORAGE_KEY = 'miplace-locale';
    const SUPPORTED = ['pt', 'en', 'es'];
    const DEFAULT_LOCALE = 'pt';

    /** @type {Record<string, Record<string, string>>} */
    const DICT = {
        pt: {
            'meta.title': 'Miplace Group — Tecnologia global. Cuidado local.',
            'meta.description': 'Grupo brasileiro de tecnologia e lifestyle com curadoria global, quatro lojas em Piracicaba e Amparo, sete anos de história e parcelamento em até 24x no boleto.',
            'meta.ogLocale': 'pt_BR',
            'a11y.skip': 'Pular para o conteúdo',
            'utility.tagline': 'Tecnologia global. Cuidado local.',
            'utility.press': 'Imprensa',
            'utility.careers': 'Carreiras',
            'lang.label': 'Idioma',
            'nav.about': 'A Miplace',
            'nav.business': 'Negócios',
            'nav.brands': 'Marcas',
            'nav.collection': 'Coleção',
            'nav.presence': 'Presença',
            'nav.commitments': 'Compromissos',
            'nav.careers': 'Carreiras',
            'nav.contact': 'Contato',
            'header.contact': 'Fale na Miplace',
            'header.menu': 'Abrir menu',
            'header.close': 'Fechar menu',
            'audio.play': 'Ativar música de fundo',
            'audio.pause': 'Pausar música de fundo',
            'audio.title': 'Música de fundo',
            'hero.eyebrow': 'Grupo brasileiro • Curadoria global',
            'hero.title': 'Tecnologia global. Cuidado local.',
            'hero.lead': 'Conectamos pessoas à melhor tecnologia do mundo com curadoria especializada, acesso facilitado e um atendimento que só uma operação próxima pode oferecer.',
            'hero.cta1': 'Conheça a Miplace',
            'hero.cta2': 'Explorar a coleção',
            'hero.imageAlt': 'Smartphone em moldura Miplace',
            'hero.stat1': '7 anos de história',
            'hero.stat2': '4 lojas',
            'hero.stat3': '9 marcas globais',
            'hero.stat4': '24x no boleto',
            'manifesto.eyebrow': 'A Miplace',
            'manifesto.title': 'Uma empresa de tecnologia com alma de bairro.',
            'manifesto.text': 'Nascemos no interior de São Paulo com uma convicção simples: acesso à alta tecnologia não deveria ser complicado. Hoje, reunimos as marcas mais desejadas do mundo em uma operação que combina curadoria, crédito acessível e atendimento humano.',
            'manifesto.pillar1.title': 'Curadoria',
            'manifesto.pillar1.body': 'Selecionamos as marcas e os modelos que fazem sentido para cada perfil, sem ruído e sem excesso.',
            'manifesto.pillar2.title': 'Acesso',
            'manifesto.pillar2.body': 'Parcelamento em até 24x no boleto, sem consulta, para aproximar a alta tecnologia da vida real.',
            'manifesto.pillar3.title': 'Proximidade',
            'manifesto.pillar3.body': 'Quatro lojas, equipes especializadas e atendimento humano antes, durante e depois da compra.',
            'manifesto.imageAlt': 'Honor Magic 8 Lite',
            'numbers.title': 'A Miplace em números',
            'numbers.years': 'anos de história',
            'numbers.stores': 'lojas',
            'numbers.brands': 'marcas globais',
            'numbers.products': 'produtos',
            'numbers.installment': 'no boleto',
            'numbers.cities': 'cidades',
            'business.eyebrow': 'Negócios',
            'business.title': 'Um grupo, várias formas de chegar até você.',
            'business.retail.title': 'Varejo',
            'business.retail.body': 'Lojas físicas com consultoria especializada e as principais marcas do mercado.',
            'business.credit.title': 'Crediário & Serviços',
            'business.credit.body': 'Parcelamento próprio em até 24x no boleto, sem consulta, e suporte pós-venda.',
            'business.digital.title': 'Digital & Curadoria',
            'business.digital.body': 'Catálogo online, conteúdo editorial e atendimento por WhatsApp.',
            'business.partners.title': 'Parcerias',
            'business.partners.body': 'Relações de longo prazo com fabricantes e distribuidores globais.',
            'brands.eyebrow': 'Marcas',
            'brands.title': 'As marcas que movem o mundo, na sua mão.',
            'brands.text': 'Trabalhamos com as principais fabricantes globais de smartphones, tablets e acessórios.',
            'brands.note': 'Acessórios e proteção Rockspace.',
            'brands.view': 'Ver produtos',
            'presence.eyebrow': 'Presença',
            'presence.title': 'Perto de você, com padrão global.',
            'presence.text': 'Nossa operação está em Piracicaba e Amparo, no interior de São Paulo. Um time local, processos internacionais e uma experiência digital em português, inglês e espanhol.',
            'commitments.eyebrow': 'Compromissos',
            'commitments.title': 'O próximo ciclo exige mais do que vender tecnologia.',
            'commitments.access.title': 'Acesso',
            'commitments.access.body': 'Crédito transparente e condições claras para democratizar o acesso à tecnologia.',
            'commitments.circularity.title': 'Circularidade',
            'commitments.circularity.body': 'Estruturar logística reversa e descarte responsável de eletrônicos.',
            'commitments.people.title': 'Pessoas',
            'commitments.people.body': 'Formação contínua e oportunidades de carreira para o nosso time.',
            'commitments.transparency.title': 'Transparência',
            'commitments.transparency.body': 'Comunicação clara sobre preços, prazos e condições.',
            'commitments.note': 'Compromissos em evolução. Estamos estruturando nossos indicadores e metas públicas.',
            'careers.eyebrow': 'Carreiras',
            'careers.title': 'O próximo capítulo começa com pessoas.',
            'careers.text': 'Buscamos gente que gosta de tecnologia, de gente e de fazer acontecer. Se você quer construir uma empresa brasileira com ambição global, envie seu perfil.',
            'careers.cta': 'Banco de talentos',
            'careers.values': 'Nossos valores',
            'careers.value1': 'Curadoria',
            'careers.value2': 'Proximidade',
            'careers.value3': 'Responsabilidade',
            'careers.value4': 'Ambição global',
            'press.eyebrow': 'Imprensa',
            'press.title': 'Miplace para a imprensa.',
            'press.text': 'Materiais institucionais, dados da operação e agendamento de entrevistas. Fale com o nosso time de comunicação.',
            'press.cta': 'Solicitar material',
            'catalog.eyebrow': 'Miplace Magazine',
            'catalog.title': 'A Coleção',
            'catalog.text': 'Curadoria de smartphones e tablets das principais marcas globais. Produtos e condições em português.',
            'catalog.total': 'produtos na coleção',
            'catalog.searchPlaceholder': 'Buscar produto... ex: Redmi, AMOLED, 5G',
            'catalog.searchLabel': 'Buscar produtos no catálogo',
            'catalog.filterLabel': 'Filtrar por marca',
            'catalog.accessoriesTitle': 'Acessórios & Proteção',
            'catalog.accessoriesText': 'Fones, microfones, carregadores, cabos e a exclusiva película de proteção Rockspace.',
            'catalog.accessoriesCta': 'Consultar estoque',
            'contact.eyebrow': 'Contato',
            'contact.title': 'Vamos conversar.',
            'contact.text': 'Atendimento consultivo, parcerias, imprensa ou carreiras. Escolha o assunto e nosso time responde.',
            'contact.name': 'Nome',
            'contact.email': 'E-mail',
            'contact.phone': 'Telefone',
            'contact.subject': 'Assunto',
            'contact.subject.general': 'Geral',
            'contact.subject.sales': 'Vendas',
            'contact.subject.partnerships': 'Parcerias',
            'contact.subject.press': 'Imprensa',
            'contact.subject.careers': 'Carreiras',
            'contact.subject.privacy': 'Privacidade',
            'contact.subject.accessibility': 'Acessibilidade',
            'contact.message': 'Mensagem',
            'contact.consent': 'Li e aceito o uso dos meus dados para retorno deste contato.',
            'contact.submit': 'Enviar mensagem',
            'contact.sending': 'Enviando...',
            'contact.success': 'Mensagem enviada. Nosso time responde em breve.',
            'contact.error': 'Não foi possível enviar agora. Escreva para',
            'contact.whatsapp': 'Prefere falar pelo WhatsApp?',
            'contact.asideTitle': 'Atendimento consultivo',
            'contact.asideText': 'Nosso time responde a assuntos comerciais, parcerias, imprensa e carreiras.',
            'contact.cities': 'Piracicaba e Amparo, SP',
            'contact.stores': '4 lojas',
            'contact.storesTitle': 'Fale direto com cada loja',
            'footer.tagline': 'Tecnologia global. Cuidado local.',
            'footer.group': 'Grupo',
            'footer.business': 'Negócios',
            'footer.contact': 'Contato',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacidade',
            'footer.terms': 'Termos',
            'footer.accessibility': 'Acessibilidade',
            'footer.copyrightPrefix': 'Miplace Group ©',
            'footer.rights': 'Todos os direitos reservados.',
            'footer.trademarks': 'Marcas mencionadas pertencem aos seus respectivos proprietários.',
            'footer.about': 'A Miplace',
            'footer.presence': 'Presença',
            'footer.careers': 'Carreiras',
            'footer.press': 'Imprensa'
        },
        en: {
            'meta.title': 'Miplace Group — Global technology. Local care.',
            'meta.description': 'Brazilian technology and lifestyle group with global curation, four stores in Piracicaba and Amparo, seven years of history and up to 24 installments on boleto.',
            'meta.ogLocale': 'en_US',
            'a11y.skip': 'Skip to content',
            'utility.tagline': 'Global technology. Local care.',
            'utility.press': 'Press',
            'utility.careers': 'Careers',
            'lang.label': 'Language',
            'nav.about': 'About Miplace',
            'nav.business': 'Business',
            'nav.brands': 'Brands',
            'nav.collection': 'Collection',
            'nav.presence': 'Presence',
            'nav.commitments': 'Commitments',
            'nav.careers': 'Careers',
            'nav.contact': 'Contact',
            'header.contact': 'Talk to Miplace',
            'header.menu': 'Open menu',
            'header.close': 'Close menu',
            'audio.play': 'Play background music',
            'audio.pause': 'Pause background music',
            'audio.title': 'Background music',
            'hero.eyebrow': 'Brazilian group • Global curation',
            'hero.title': 'Global technology. Local care.',
            'hero.lead': 'We connect people to the world’s best technology with expert curation, easier access and the kind of service only a nearby operation can offer.',
            'hero.cta1': 'Discover Miplace',
            'hero.cta2': 'Explore the collection',
            'hero.imageAlt': 'Smartphone in a Miplace frame',
            'hero.stat1': '7 years of history',
            'hero.stat2': '4 stores',
            'hero.stat3': '9 global brands',
            'hero.stat4': '24x on boleto',
            'manifesto.eyebrow': 'About Miplace',
            'manifesto.title': 'A technology company with a neighborhood soul.',
            'manifesto.text': 'We were born in the interior of São Paulo with a simple conviction: access to high technology should not be complicated. Today we bring the world’s most desired brands together in an operation that combines curation, accessible credit and human service.',
            'manifesto.pillar1.title': 'Curation',
            'manifesto.pillar1.body': 'We select the brands and models that make sense for each profile, without noise and without excess.',
            'manifesto.pillar2.title': 'Access',
            'manifesto.pillar2.body': 'Up to 24 installments on boleto, with no credit check, bringing high technology closer to real life.',
            'manifesto.pillar3.title': 'Proximity',
            'manifesto.pillar3.body': 'Four stores, specialized teams and human service before, during and after the purchase.',
            'manifesto.imageAlt': 'Honor Magic 8 Lite',
            'numbers.title': 'Miplace in numbers',
            'numbers.years': 'years of history',
            'numbers.stores': 'stores',
            'numbers.brands': 'global brands',
            'numbers.products': 'products',
            'numbers.installment': 'on boleto',
            'numbers.cities': 'cities',
            'business.eyebrow': 'Business',
            'business.title': 'One group, many ways to reach you.',
            'business.retail.title': 'Retail',
            'business.retail.body': 'Physical stores with specialized consulting and the leading brands in the market.',
            'business.credit.title': 'Credit & Services',
            'business.credit.body': 'In-house financing in up to 24 installments on boleto, with no credit check, and after-sales support.',
            'business.digital.title': 'Digital & Curation',
            'business.digital.body': 'Online catalog, editorial content and WhatsApp service.',
            'business.partners.title': 'Partnerships',
            'business.partners.body': 'Long-term relationships with global manufacturers and distributors.',
            'brands.eyebrow': 'Brands',
            'brands.title': 'The brands that move the world, in your hands.',
            'brands.text': 'We work with the leading global manufacturers of smartphones, tablets and accessories.',
            'brands.note': 'Accessories and protection by Rockspace.',
            'brands.view': 'View products',
            'presence.eyebrow': 'Presence',
            'presence.title': 'Close to you, with a global standard.',
            'presence.text': 'Our operation is in Piracicaba and Amparo, in the interior of São Paulo. A local team, international processes and a digital experience in Portuguese, English and Spanish.',
            'commitments.eyebrow': 'Commitments',
            'commitments.title': 'The next cycle demands more than selling technology.',
            'commitments.access.title': 'Access',
            'commitments.access.body': 'Transparent credit and clear conditions to democratize access to technology.',
            'commitments.circularity.title': 'Circularity',
            'commitments.circularity.body': 'Structure reverse logistics and responsible electronic waste disposal.',
            'commitments.people.title': 'People',
            'commitments.people.body': 'Continuous training and career opportunities for our team.',
            'commitments.transparency.title': 'Transparency',
            'commitments.transparency.body': 'Clear communication about prices, deadlines and conditions.',
            'commitments.note': 'Commitments in progress. We are structuring our public indicators and targets.',
            'careers.eyebrow': 'Careers',
            'careers.title': 'The next chapter starts with people.',
            'careers.text': 'We look for people who enjoy technology, people and making things happen. If you want to build a Brazilian company with global ambition, send us your profile.',
            'careers.cta': 'Talent pool',
            'careers.values': 'Our values',
            'careers.value1': 'Curation',
            'careers.value2': 'Proximity',
            'careers.value3': 'Responsibility',
            'careers.value4': 'Global ambition',
            'press.eyebrow': 'Press',
            'press.title': 'Miplace for the press.',
            'press.text': 'Institutional materials, operation data and interview scheduling. Talk to our communications team.',
            'press.cta': 'Request material',
            'catalog.eyebrow': 'Miplace Magazine',
            'catalog.title': 'The Collection',
            'catalog.text': 'A curated selection of smartphones and tablets from leading global brands. Products and conditions in Portuguese.',
            'catalog.total': 'products in the collection',
            'catalog.searchPlaceholder': 'Search products... e.g. Redmi, AMOLED, 5G',
            'catalog.searchLabel': 'Search products in the catalog',
            'catalog.filterLabel': 'Filter by brand',
            'catalog.accessoriesTitle': 'Accessories & Protection',
            'catalog.accessoriesText': 'Headphones, microphones, chargers, cables and the exclusive Rockspace screen protector.',
            'catalog.accessoriesCta': 'Check availability',
            'contact.eyebrow': 'Contact',
            'contact.title': 'Let’s talk.',
            'contact.text': 'Consultative service, partnerships, press or careers. Choose a subject and our team will reply.',
            'contact.name': 'Name',
            'contact.email': 'Email',
            'contact.phone': 'Phone',
            'contact.subject': 'Subject',
            'contact.subject.general': 'General',
            'contact.subject.sales': 'Sales',
            'contact.subject.partnerships': 'Partnerships',
            'contact.subject.press': 'Press',
            'contact.subject.careers': 'Careers',
            'contact.subject.privacy': 'Privacy',
            'contact.subject.accessibility': 'Accessibility',
            'contact.message': 'Message',
            'contact.consent': 'I have read and accept the use of my data so this contact can be answered.',
            'contact.submit': 'Send message',
            'contact.sending': 'Sending...',
            'contact.success': 'Message sent. Our team will reply soon.',
            'contact.error': 'We could not send it now. Write to',
            'contact.whatsapp': 'Prefer WhatsApp?',
            'contact.asideTitle': 'Consultative service',
            'contact.asideText': 'Our team answers commercial matters, partnerships, press and careers.',
            'contact.cities': 'Piracicaba and Amparo, SP',
            'contact.stores': '4 stores',
            'contact.storesTitle': 'Talk to each store',
            'footer.tagline': 'Global technology. Local care.',
            'footer.group': 'Group',
            'footer.business': 'Business',
            'footer.contact': 'Contact',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacy',
            'footer.terms': 'Terms',
            'footer.accessibility': 'Accessibility',
            'footer.copyrightPrefix': 'Miplace Group ©',
            'footer.rights': 'All rights reserved.',
            'footer.trademarks': 'Mentioned brands belong to their respective owners.',
            'footer.about': 'About Miplace',
            'footer.presence': 'Presence',
            'footer.careers': 'Careers',
            'footer.press': 'Press'
        },
        es: {
            'meta.title': 'Miplace Group — Tecnología global. Cuidado local.',
            'meta.description': 'Grupo brasileño de tecnología y lifestyle con curaduría global, cuatro tiendas en Piracicaba y Amparo, siete años de historia y hasta 24 cuotas en boleto.',
            'meta.ogLocale': 'es_ES',
            'a11y.skip': 'Saltar al contenido',
            'utility.tagline': 'Tecnología global. Cuidado local.',
            'utility.press': 'Prensa',
            'utility.careers': 'Carreras',
            'lang.label': 'Idioma',
            'nav.about': 'Sobre Miplace',
            'nav.business': 'Negocios',
            'nav.brands': 'Marcas',
            'nav.collection': 'Colección',
            'nav.presence': 'Presencia',
            'nav.commitments': 'Compromisos',
            'nav.careers': 'Carreras',
            'nav.contact': 'Contacto',
            'header.contact': 'Habla con Miplace',
            'header.menu': 'Abrir menú',
            'header.close': 'Cerrar menú',
            'audio.play': 'Activar música de fondo',
            'audio.pause': 'Pausar música de fondo',
            'audio.title': 'Música de fondo',
            'hero.eyebrow': 'Grupo brasileño • Curaduría global',
            'hero.title': 'Tecnología global. Cuidado local.',
            'hero.lead': 'Conectamos a las personas con la mejor tecnología del mundo mediante curaduría especializada, acceso facilitado y una atención que solo una operación cercana puede ofrecer.',
            'hero.cta1': 'Conoce Miplace',
            'hero.cta2': 'Explorar la colección',
            'hero.imageAlt': 'Smartphone en marco Miplace',
            'hero.stat1': '7 años de historia',
            'hero.stat2': '4 tiendas',
            'hero.stat3': '9 marcas globales',
            'hero.stat4': '24x en boleto',
            'manifesto.eyebrow': 'Sobre Miplace',
            'manifesto.title': 'Una empresa de tecnología con alma de barrio.',
            'manifesto.text': 'Nacimos en el interior de São Paulo con una convicción simple: el acceso a la alta tecnología no debería ser complicado. Hoy reunimos las marcas más deseadas del mundo en una operación que combina curaduría, crédito accesible y atención humana.',
            'manifesto.pillar1.title': 'Curaduría',
            'manifesto.pillar1.body': 'Seleccionamos las marcas y los modelos que tienen sentido para cada perfil, sin ruido y sin exceso.',
            'manifesto.pillar2.title': 'Acceso',
            'manifesto.pillar2.body': 'Hasta 24 cuotas en boleto, sin consulta, para acercar la alta tecnología a la vida real.',
            'manifesto.pillar3.title': 'Cercanía',
            'manifesto.pillar3.body': 'Cuatro tiendas, equipos especializados y atención humana antes, durante y después de la compra.',
            'manifesto.imageAlt': 'Honor Magic 8 Lite',
            'numbers.title': 'Miplace en números',
            'numbers.years': 'años de historia',
            'numbers.stores': 'tiendas',
            'numbers.brands': 'marcas globales',
            'numbers.products': 'productos',
            'numbers.installment': 'en boleto',
            'numbers.cities': 'ciudades',
            'business.eyebrow': 'Negocios',
            'business.title': 'Un grupo, muchas formas de llegar hasta ti.',
            'business.retail.title': 'Comercio minorista',
            'business.retail.body': 'Tiendas físicas con asesoría especializada y las principales marcas del mercado.',
            'business.credit.title': 'Crédito y Servicios',
            'business.credit.body': 'Financiamiento propio en hasta 24 cuotas en boleto, sin consulta, y soporte posventa.',
            'business.digital.title': 'Digital y Curaduría',
            'business.digital.body': 'Catálogo online, contenido editorial y atención por WhatsApp.',
            'business.partners.title': 'Alianzas',
            'business.partners.body': 'Relaciones de largo plazo con fabricantes y distribuidores globales.',
            'brands.eyebrow': 'Marcas',
            'brands.title': 'Las marcas que mueven el mundo, en tu mano.',
            'brands.text': 'Trabajamos con los principales fabricantes globales de smartphones, tablets y accesorios.',
            'brands.note': 'Accesorios y protección Rockspace.',
            'brands.view': 'Ver productos',
            'presence.eyebrow': 'Presencia',
            'presence.title': 'Cerca de ti, con estándar global.',
            'presence.text': 'Nuestra operación está en Piracicaba y Amparo, en el interior de São Paulo. Un equipo local, procesos internacionales y una experiencia digital en portugués, inglés y español.',
            'commitments.eyebrow': 'Compromisos',
            'commitments.title': 'El próximo ciclo exige más que vender tecnología.',
            'commitments.access.title': 'Acceso',
            'commitments.access.body': 'Crédito transparente y condiciones claras para democratizar el acceso a la tecnología.',
            'commitments.circularity.title': 'Circularidad',
            'commitments.circularity.body': 'Estructurar logística inversa y disposición responsable de electrónicos.',
            'commitments.people.title': 'Personas',
            'commitments.people.body': 'Formación continua y oportunidades de carrera para nuestro equipo.',
            'commitments.transparency.title': 'Transparencia',
            'commitments.transparency.body': 'Comunicación clara sobre precios, plazos y condiciones.',
            'commitments.note': 'Compromisos en evolución. Estamos estructurando nuestros indicadores y metas públicas.',
            'careers.eyebrow': 'Carreras',
            'careers.title': 'El próximo capítulo empieza con personas.',
            'careers.text': 'Buscamos personas que disfruten de la tecnología, de la gente y de hacer que las cosas sucedan. Si quieres construir una empresa brasileña con ambición global, envíanos tu perfil.',
            'careers.cta': 'Banco de talentos',
            'careers.values': 'Nuestros valores',
            'careers.value1': 'Curaduría',
            'careers.value2': 'Cercanía',
            'careers.value3': 'Responsabilidad',
            'careers.value4': 'Ambición global',
            'press.eyebrow': 'Prensa',
            'press.title': 'Miplace para la prensa.',
            'press.text': 'Materiales institucionales, datos de la operación y agenda de entrevistas. Habla con nuestro equipo de comunicación.',
            'press.cta': 'Solicitar material',
            'catalog.eyebrow': 'Miplace Magazine',
            'catalog.title': 'La Colección',
            'catalog.text': 'Curaduría de smartphones y tablets de las principales marcas globales. Productos y condiciones en portugués.',
            'catalog.total': 'productos en la colección',
            'catalog.searchPlaceholder': 'Buscar producto... ej: Redmi, AMOLED, 5G',
            'catalog.searchLabel': 'Buscar productos en el catálogo',
            'catalog.filterLabel': 'Filtrar por marca',
            'catalog.accessoriesTitle': 'Accesorios y Protección',
            'catalog.accessoriesText': 'Auriculares, micrófonos, cargadores, cables y el exclusivo protector de pantalla Rockspace.',
            'catalog.accessoriesCta': 'Consultar disponibilidad',
            'contact.eyebrow': 'Contacto',
            'contact.title': 'Hablemos.',
            'contact.text': 'Atención consultiva, alianzas, prensa o carreras. Elige un asunto y nuestro equipo responde.',
            'contact.name': 'Nombre',
            'contact.email': 'Correo electrónico',
            'contact.phone': 'Teléfono',
            'contact.subject': 'Asunto',
            'contact.subject.general': 'General',
            'contact.subject.sales': 'Ventas',
            'contact.subject.partnerships': 'Alianzas',
            'contact.subject.press': 'Prensa',
            'contact.subject.careers': 'Carreras',
            'contact.subject.privacy': 'Privacidad',
            'contact.subject.accessibility': 'Accesibilidad',
            'contact.message': 'Mensaje',
            'contact.consent': 'He leído y acepto el uso de mis datos para responder a este contacto.',
            'contact.submit': 'Enviar mensaje',
            'contact.sending': 'Enviando...',
            'contact.success': 'Mensaje enviado. Nuestro equipo responderá pronto.',
            'contact.error': 'No fue posible enviar ahora. Escribe a',
            'contact.whatsapp': '¿Prefieres WhatsApp?',
            'contact.asideTitle': 'Atención consultiva',
            'contact.asideText': 'Nuestro equipo responde a asuntos comerciales, alianzas, prensa y carreras.',
            'contact.cities': 'Piracicaba y Amparo, SP',
            'contact.stores': '4 tiendas',
            'contact.storesTitle': 'Habla con cada tienda',
            'footer.tagline': 'Tecnología global. Cuidado local.',
            'footer.group': 'Grupo',
            'footer.business': 'Negocios',
            'footer.contact': 'Contacto',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacidad',
            'footer.terms': 'Términos',
            'footer.accessibility': 'Accesibilidad',
            'footer.copyrightPrefix': 'Miplace Group ©',
            'footer.rights': 'Todos los derechos reservados.',
            'footer.trademarks': 'Las marcas mencionadas pertenecen a sus respectivos propietarios.',
            'footer.about': 'Sobre Miplace',
            'footer.presence': 'Presencia',
            'footer.careers': 'Carreras',
            'footer.press': 'Prensa'
        }
    };

    /** @type {string} */
    let currentLocale = DEFAULT_LOCALE;

    /**
     * @param {string} key
     * @returns {string}
     */
    function t(key) {
        return DICT[currentLocale]?.[key] || DICT[DEFAULT_LOCALE][key] || key;
    }

    /**
     * @param {string} value
     * @returns {boolean}
     */
    function isSupported(value) {
        return SUPPORTED.includes(value);
    }

    /** @returns {string} */
    function readStoredLocale() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && isSupported(stored)) return stored;
        } catch (_e) { /* Safari private mode */ }
        return DEFAULT_LOCALE;
    }

    /** @returns {string} */
    function readInitialLocale() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('lang') || '';
        if (isSupported(fromUrl)) return fromUrl;
        return readStoredLocale();
    }

    /**
     * @param {Element} el
     * @returns {void}
     */
    function applyAttribute(el) {
        const raw = el.getAttribute('data-i18n-attr') || '';
        raw.split(';').forEach(pair => {
            const [attr, valueKey] = pair.split(':').map(part => part.trim());
            if (!attr || !valueKey) return;
            el.setAttribute(attr, t(valueKey));
        });
    }

    /** @returns {void} */
    function applyMeta() {
        document.title = t('meta.title');
        const description = document.querySelector('meta[name="description"]');
        if (description instanceof HTMLMetaElement) description.content = t('meta.description');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle instanceof HTMLMetaElement) ogTitle.content = t('meta.title');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription instanceof HTMLMetaElement) ogDescription.content = t('meta.description');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle instanceof HTMLMetaElement) twitterTitle.content = t('meta.title');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription instanceof HTMLMetaElement) twitterDescription.content = t('meta.description');
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale instanceof HTMLMetaElement) ogLocale.content = t('meta.ogLocale');
    }

    /** @returns {void} */
    function apply() {
        document.documentElement.lang = currentLocale === 'pt' ? 'pt-BR' : currentLocale;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(el => applyAttribute(el));
        document.querySelectorAll('[data-lang]').forEach(el => {
            const lang = el.getAttribute('data-lang') || '';
            el.setAttribute('aria-pressed', String(lang === currentLocale));
        });
        applyMeta();
    }

    /**
     * @param {string} locale
     * @returns {void}
     */
    function setLocale(locale) {
        if (!isSupported(locale)) return;
        currentLocale = locale;
        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch (_e) { /* quota / private mode */ }
        const url = new URL(window.location.href);
        url.searchParams.set('lang', locale);
        window.history.replaceState({}, '', url.toString());
        apply();
        window.dispatchEvent(new CustomEvent('miplace:localechange', { detail: { locale } }));
    }

    /** @returns {void} */
    function init() {
        currentLocale = readInitialLocale();
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.addEventListener('click', event => {
                event.preventDefault();
                const lang = el.getAttribute('data-lang') || '';
                if (lang && lang !== currentLocale) setLocale(lang);
            });
        });
        apply();
    }

    window.MiplaceI18n = {
        getLocale: () => currentLocale,
        setLocale,
        t,
        apply
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
