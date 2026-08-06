import { ProjectManager } from "./project/projectManager.js"

export async function launchProject(path, args={}) {
    let project = new ProjectManager(args)
    await project.load(path)
    await project.start()
}