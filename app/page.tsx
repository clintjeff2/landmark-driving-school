import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Calendar, CreditCard, BookOpen, Award, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Car className="h-6 w-6" />
            <span>Landmark Driving School</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Learn to Drive with Confidence
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Landmark Driving School offers comprehensive driving lessons with experienced instructors, flexible
                  scheduling, and a modern e-learning platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Driving lesson"
                  className="aspect-video object-cover w-full"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to become a confident driver
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Flexible Scheduling</h3>
                <p className="text-center text-muted-foreground">
                  Book lessons at your convenience with our easy scheduling system.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <BookOpen className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">E-Learning Hub</h3>
                <p className="text-center text-muted-foreground">
                  Access videos and articles to supplement your practical lessons.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <CreditCard className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Easy Payments</h3>
                <p className="text-center text-muted-foreground">
                  Secure online payment system with multiple payment options.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Certified Instructors</h3>
                <p className="text-center text-muted-foreground">
                  Learn from experienced and certified driving instructors.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <Award className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Rewards Program</h3>
                <p className="text-center text-muted-foreground">
                  Earn points for attendance and redeem them for rewards.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <Car className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Modern Vehicles</h3>
                <p className="text-center text-muted-foreground">
                  Practice in well-maintained, modern vehicles for a comfortable learning experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Register now and begin your journey to becoming a confident driver.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg">Register Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Car className="h-5 w-5" />
            <span>Landmark Driving School</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Landmark Driving School. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
