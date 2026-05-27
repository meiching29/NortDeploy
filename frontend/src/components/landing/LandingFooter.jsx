import uninorte60 from '../../assets/roble-uninorte.png'

export default function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.03] py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-5 flex-wrap">
        <img
          src={uninorte60}
          alt="Uninorte 60 años"
          className="h-9 w-auto opacity-40 hover:opacity-70 transition-opacity duration-500"
        />
      </div>
    </footer>
  )
}
