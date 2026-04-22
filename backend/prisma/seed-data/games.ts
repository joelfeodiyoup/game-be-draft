import { Prisma } from '@prisma/client';

export const games: Prisma.GameCreateInput[] = [
    { title: 'transport tycoon', description: 'connect towns and industries with transport'},
    { title: 'zeus: master of olympus', description: 'build a city in ancient greece'},
    { title: 'rollercoaster tycoon', description: 'build a rollercoaster park'},
]