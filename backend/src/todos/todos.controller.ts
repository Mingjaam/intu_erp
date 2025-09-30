import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto, TodoQueryDto } from './dto/todo.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/database/entities/user.entity';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req: { user: User }) {
    return this.todosService.create(createTodoDto, req.user);
  }

  @Get()
  findAll(@Query() query: TodoQueryDto, @Request() req: { user: User }) {
    return this.todosService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.todosService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req: { user: User }) {
    return this.todosService.update(id, updateTodoDto, req.user);
  }

  @Patch(':id/toggle')
  toggleComplete(@Param('id') id: string, @Request() req: { user: User }) {
    return this.todosService.toggleComplete(id, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.todosService.remove(id, req.user);
  }
}
