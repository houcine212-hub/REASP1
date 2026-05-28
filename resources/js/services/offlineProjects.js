import { createProject, createArticle } from "./api";

const LOCAL_KEY = "local_projects_v1";
const QUEUE_KEY = "offline_projects_queue";

export function getLocalProjects() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveLocalProjects(projects) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
}

export function getOfflineQueue() {
    try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveOfflineQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingProjects() {
    return getLocalProjects().filter((p) => !p.synced);
}

export async function syncOfflineProjects(onProjectSynced) {
    const queue = getOfflineQueue();
    if (!queue.length || !navigator.onLine) return;

    const failed = [];
    for (const proj of queue) {
        try {
            const res = await createProject({
                name: proj.name,
                type: proj.type,
            });
            const projectId = res.data.id;

            if (proj.fileType)
                localStorage.setItem(`proj_fmt_${projectId}`, proj.fileType);
            if (proj.xlsxStyle)
                localStorage.setItem(
                    `proj_style_${projectId}`,
                    JSON.stringify(proj.xlsxStyle),
                );

            for (const article of proj.articles) {
                await createArticle(projectId, article);
            }

            const projects = getLocalProjects();
            const idx = projects.findIndex((p) => p.localId === proj.localId);
            if (idx >= 0) {
                projects[idx].synced = true;
                projects[idx].projectId = projectId;
                saveLocalProjects(projects);
            }

            onProjectSynced?.(proj.localId, projectId);
        } catch {
            failed.push(proj);
        }
    }

    saveOfflineQueue(failed);
    return failed.length;
}
