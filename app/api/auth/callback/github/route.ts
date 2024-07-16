import { getProjectById, updateProject } from "@/db/queries/project-queries"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const installationId = parseInt(searchParams.get("installation_id")!)
  const state = searchParams.get("state")

  if (!installationId || !state) {
    return new Response(
      JSON.stringify({ error: "Missing installation ID or state" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    )
  }

  const { projectId } = JSON.parse(decodeURIComponent(state))

  try {
    try {
      const project = await getProjectById(projectId)

      if (!project) {
        throw new Error("Project not found")
      }

      await updateProject(project.id, {
        githubInstallationId: installationId
      })

      revalidatePath(`/`)
    } catch (error) {
      console.error("Error authenticating:", error)
    }
  } catch (error: any) {
    console.error("Error in GitHub callback:", error)
  }

  return redirect(`/${projectId}/setup`)
}
