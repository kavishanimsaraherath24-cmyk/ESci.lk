import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent mb-2">
          Register for ESci.lk
        </h1>
        <p className="text-center text-gray-500 mb-6 sinhala">මොළේට දැනෙන්න Science</p>
        <RegisterForm />
      </div>
    </div>
  )
}