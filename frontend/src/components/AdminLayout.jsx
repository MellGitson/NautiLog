import { NavLink, Outlet } from 'react-router-dom'

const SECTIONS = [
  { to: '/admin', label: 'Overview', fin: true },
  { to: '/admin/flotte', label: 'Flotte' },
  { to: '/admin/ports', label: 'Ports' },
  { to: '/admin/reservations', label: 'Réservations' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs' },
]

export default function AdminLayout() {
  const lienSidebar = ({ isActive }) =>
    `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-ocean-700 text-white' : 'text-ocean-700 hover:bg-ocean-50'
    }`

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-6 py-10">
      <aside className="w-48 shrink-0">
        <h2 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wide text-ocean-400">
          Administration
        </h2>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.fin} className={lienSidebar}>
              {s.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
