import { createClient } from '@/lib/supabase/server'
import StudentRow from './StudentRow'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ grade?: string; status?: string; q?: string }> }) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select('id, student_code, current_grade, school_name, parent_phone, profiles(id, full_name, email, status)')
    .order('created_at', { ascending: false })

  if (sp.grade) query = query.eq('current_grade', Number(sp.grade))
  if (sp.q) query = query.ilike('school_name', `%${sp.q}%`)

  const { data: students } = await query

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <form action="/api/admin/export-students" method="get">
          <button className="px-3 py-2 rounded-full bg-gray-800 text-white text-sm">Export CSV</button>
        </form>
      </div>

      <form className="flex gap-2 bg-white p-3 rounded-xl shadow">
        <input name="q" defaultValue={sp.q} placeholder="Search by school..." className="flex-1 border rounded-lg px-3 py-2" />
        <select name="grade" defaultValue={sp.grade} className="border rounded-lg px-3 py-2">
          <option value="">All Grades</option>
          {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <button className="px-4 py-2 rounded-full gradient-btn text-white">Filter</button>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Code</th><th>Name</th><th>Grade</th><th>School</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s: any) => (
              <StudentRow key={s.id} student={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}