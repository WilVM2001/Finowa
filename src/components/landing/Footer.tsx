"use client"

import Link from "next/link"

const footerLinks = [
  {
    title: "Producto",
    links: ["Características", "Precios", "Integraciones", "API"],
  },
  {
    title: "Compañía",
    links: ["Sobre Nosotros", "Blog", "Documentación", "Contacto"],
  },
  {
    title: "Legal",
    links: ["Privacidad", "Términos", "Cookies", "Seguridad"],
  },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-lg font-semibold text-white">Finanza</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Gestión financiera inteligente para el mundo moderno.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Finanza. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
