import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from 'src/constants';
import { eq } from 'drizzle-orm';
import * as schema from 'src/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(userId: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
  }

  async findOneByName(name: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.name, name),
    });
  }

  async createOne(userDTO: { name: string; password: string; email: string }) {
    const res = await this.db.insert(schema.users).values(userDTO).returning();
    return res[0];
  }
}
