import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models';
import { PG_CONNECTION } from 'src/constants';
import { eq } from 'drizzle-orm';
import { users } from 'src/drizzle/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_CONNECTION) private db) {}

  async findOne(userId: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, userId) });
  }

  async findOneByName(name: string) {
    return this.db.query.users.findFirst({ where: eq(users.name, name) });
  }

  async createOne(userDTO: User) {
    const res = await this.db.insert(users).values(userDTO).returning();
    return res[0];
  }
}
