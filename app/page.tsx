import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Calendar, CreditCard, BookOpen, Award, Shield, Star, Users, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 rounded-lg gradient-blue">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Landmark Driving School
            </span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 btn-animate">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="gradient-blue text-white hover:opacity-90 btn-animate">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-gold-100 text-sm font-medium text-blue-800">
                  <Star className="h-4 w-4 text-gold-600" />
                  #1 Rated Driving School
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Learn to Drive with{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-gold-500 bg-clip-text text-transparent">
                    Confidence
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Landmark Driving School offers comprehensive driving lessons with experienced instructors, flexible
                  scheduling, and a modern e-learning platform designed for your success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="gradient-blue-gold text-white hover:opacity-90 btn-animate px-8 py-3 text-lg"
                    >
                      Get Started Today
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 btn-animate px-8 py-3 text-lg"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Licensed & Insured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">5000+ Students</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 gradient-blue-gold rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src="/placeholder.svg?height=500&width=700"
                    alt="Professional driving lesson"
                    className="aspect-[4/3] object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-blue-600 to-gold-500 bg-clip-text text-transparent">
                  Landmark
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600">
                Everything you need to become a confident and skilled driver
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Calendar,
                  title: "Flexible Scheduling",
                  description: "Book lessons at your convenience with our easy-to-use scheduling system.",
                  color: "blue",
                },
                {
                  icon: BookOpen,
                  title: "E-Learning Hub",
                  description: "Access comprehensive videos and articles to supplement your practical lessons.",
                  color: "gold",
                },
                {
                  icon: CreditCard,
                  title: "Easy Payments",
                  description: "Secure online payment system with multiple payment options and flexible plans.",
                  color: "blue",
                },
                {
                  icon: Shield,
                  title: "Certified Instructors",
                  description: "Learn from experienced and certified driving instructors with proven track records.",
                  color: "gold",
                },
                {
                  icon: Award,
                  title: "Rewards Program",
                  description: "Earn points for attendance and achievements, redeem them for exciting rewards.",
                  color: "blue",
                },
                {
                  icon: Car,
                  title: "Modern Vehicles",
                  description: "Practice in well-maintained, modern vehicles equipped with the latest safety features.",
                  color: "gold",
                },
              ].map((feature, index) => (
                <div key={index} className="group card-hover">
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg">
                    <div
                      className={`inline-flex p-3 rounded-xl mb-4 ${
                        feature.color === "blue" ? "gradient-blue" : "gradient-gold"
                      }`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 gradient-dark">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { number: "5000+", label: "Students Trained", icon: Users },
                { number: "98%", label: "Pass Rate", icon: CheckCircle },
                { number: "15+", label: "Years Experience", icon: Award },
                { number: "4.9", label: "Average Rating", icon: Star },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 rounded-xl gradient-gold mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                Ready to Start Your <span className="text-yellow-300">Driving Journey?</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-blue-100">
                Join thousands of successful students who have learned to drive with confidence at Landmark Driving
                School.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gradient-gold text-black hover:opacity-90 btn-animate px-8 py-3 text-lg font-semibold"
                  >
                    Register Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 btn-animate px-8 py-3 text-lg"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-gray-200 py-12 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 font-bold">
                <div className="p-2 rounded-lg gradient-blue">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Landmark Driving School
                </span>
              </div>
              <p className="text-gray-600">
                Professional driving instruction with a commitment to safety and excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
                <Link href="/register" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  Register
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Contact Info</h3>
              <div className="space-y-2 text-gray-600">
                <p>📞 (555) 123-4567</p>
                <p>📧 info@landmarkdriving.com</p>
                <p>📍 123 Main St, City, State 12345</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>© {new Date().getFullYear()} Landmark Driving School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
