import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const jobs = await prisma.generationJob.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      error_message: true,
      metadata: true,
      provider_response: true,
      results_count: true
    }
  })
  console.log(JSON.stringify(jobs, null, 2))
}

main()
