import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Todo } from '@/database/entities/todo.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateTodoDto, UpdateTodoDto, TodoQueryDto } from './dto/todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      createdById: user.id,
    });

    return this.todoRepository.save(todo);
  }

  async findAll(query: TodoQueryDto, user: User): Promise<Todo[]> {
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.createdBy', 'createdBy')
      .orderBy('todo.date', 'ASC')
      .addOrderBy('todo.createdAt', 'DESC');

    // 날짜 범위 필터
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('todo.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    // 완료 상태 필터
    if (query.completed !== undefined) {
      queryBuilder.andWhere('todo.completed = :completed', {
        completed: query.completed,
      });
    }

    // 같은 조직의 사용자들만 볼 수 있도록 제한
    if (user.organizationId) {
      queryBuilder.andWhere('createdBy.organizationId = :organizationId', {
        organizationId: user.organizationId,
      });
    } else {
      // 관리자는 모든 할 일을 볼 수 있음
      // 일반 사용자는 자신의 할 일만 볼 수 있음
      if (user.role !== UserRole.ADMIN) {
        queryBuilder.andWhere('todo.createdById = :userId', {
          userId: user.id,
        });
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!todo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }

    // 같은 조직의 사용자만 접근 가능
    if (user.organizationId && todo.createdBy.organizationId !== user.organizationId) {
      throw new ForbiddenException('이 할 일에 접근할 권한이 없습니다.');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, user: User): Promise<Todo> {
    const todo = await this.findOne(id, user);

    // 작성자만 수정 가능
    if (todo.createdById !== user.id) {
      throw new ForbiddenException('할 일을 수정할 권한이 없습니다.');
    }

    Object.assign(todo, updateTodoDto);
    return this.todoRepository.save(todo);
  }

  async remove(id: string, user: User): Promise<void> {
    const todo = await this.findOne(id, user);

    // 작성자만 삭제 가능
    if (todo.createdById !== user.id) {
      throw new ForbiddenException('할 일을 삭제할 권한이 없습니다.');
    }

    await this.todoRepository.remove(todo);
  }

  async toggleComplete(id: string, user: User): Promise<Todo> {
    const todo = await this.findOne(id, user);
    todo.completed = !todo.completed;
    return this.todoRepository.save(todo);
  }
}
