import { PgBoss } from 'pg-boss'
import { serverEnv } from './env/server'

let bossInstance: PgBoss | null = null
let startPromise: Promise<PgBoss> | null = null

function createBoss() {
	const boss = new PgBoss(serverEnv.databaseUrl)

	boss.on('error', error => console.error('pg-boss error:', error))

	return boss
}

export function getBoss() {
	if (!bossInstance) {
		bossInstance = createBoss()
	}

	return bossInstance
}

export async function startBoss() {
	if (!startPromise) {
		const boss = getBoss()
		startPromise = boss.start().then(() => boss)
	}

	return startPromise
}

export async function stopBoss() {
	if (!bossInstance) {
		return
	}

	await bossInstance.stop()
	startPromise = null
}