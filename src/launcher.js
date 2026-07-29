import { ProjectManager } from "./project/projectManager.js"

export async function launchProject(path) {
    let project = new ProjectManager()
    await project.load(path)
    await project.start()
}