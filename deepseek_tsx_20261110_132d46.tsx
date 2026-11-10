import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ESci.lk — මොළේට දැනෙන්න Science',
  description: 'Science classes for Grade 6–11 students in Sri Lanka by Kavisha Herath.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}