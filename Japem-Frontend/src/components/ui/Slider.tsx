import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade"; // Importamos estilos de fade

// Importamos módulos extra para efectos y autoplay
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

export function Slider() {
  
  // Datos de los slides para mantener el código limpio
  const slides = [
    {
      id: 1,
      title: "Juntos hacemos la diferencia",
      subtitle: "Comprometidos con la asistencia social y el desarrollo humano.",
      image: "/Japem.jpeg",
    },
    {
      id: 2,
      title: "Gestión Transparente",
      subtitle: "Control eficiente de donativos, acuerdos y beneficiarios.",
      image: "/Japem.jpeg",
    },
    {
      id: 3,
      title: "Innovación Institucional",
      subtitle: "Herramientas tecnológicas al servicio de la comunidad.",
      image: "/Japem.jpeg",
    }
  ];

  return (
    <div className="w-full relative group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade" // Efecto elegante de desvanecimiento
        fadeEffect={{ crossFade: true }}
        speed={1500} // Transición suave
        navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }}
        pagination={{ 
            clickable: true,
            dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000, 
          disableOnInteraction: false,
        }}
        loop
        className="w-full h-[250px] lg:h-[400px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full overflow-hidden">
                
                {/* 1. IMAGEN DE FONDO (Con efecto zoom suave opcional) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                    style={{ backgroundImage: `url('${slide.image}')` }}
                />

                {/* 2. OVERLAY (Capa oscura para que el texto resalte) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#353131]/90 via-[#353131]/40 to-transparent"></div>

                {/* 3. CONTENIDO DE TEXTO */}
                <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start">
                    <div className="max-w-2xl animate-fade-in-up">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                            {slide.title}
                        </h2>
                        <p className="text-lg text-gray-200 font-medium max-w-lg drop-shadow-md">
                            {slide.subtitle}
                        </p>
                    </div>
                </div>

                {/* 4. GRADIENTE INFERIOR (Para fusionarse con el Dashboard) */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f9fafb] to-transparent pointer-events-none"></div>
            </div>
          </SwiperSlide>
        ))}

        {/* Botones de Navegación Personalizados (opcional, ocultos por defecto, visibles al hover) */}
        <div className="swiper-button-prev !text-white/50 hover:!text-white after:!text-2xl transition-all opacity-0 group-hover:opacity-100"></div>
        <div className="swiper-button-next !text-white/50 hover:!text-white after:!text-2xl transition-all opacity-0 group-hover:opacity-100"></div>

      </Swiper>
      
      {/* Estilos globales para personalizar los puntitos (bullets) al verde de JAPEM */}
      <style>{`
        .swiper-pagination-bullet {
            background: white;
            opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
            background: #719c44 !important; /* Verde Institucional */
            opacity: 1;
            width: 24px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}