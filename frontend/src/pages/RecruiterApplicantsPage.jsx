import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../services/api';
// We'll mock the pipeline for demonstration

const STAGES = {
  APPLIED: 'Applied',
  REVIEWED: 'Reviewed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected'
};

const INITIAL_DATA = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Alice Smith - SDE Role' },
    'task-2': { id: 'task-2', content: 'Bob Johnson - Data Analyst' },
    'task-3': { id: 'task-3', content: 'Charlie Brown - Designer' },
  },
  columns: {
    [STAGES.APPLIED]: { id: STAGES.APPLIED, title: STAGES.APPLIED, taskIds: ['task-1', 'task-2'] },
    [STAGES.REVIEWED]: { id: STAGES.REVIEWED, title: STAGES.REVIEWED, taskIds: [] },
    [STAGES.SHORTLISTED]: { id: STAGES.SHORTLISTED, title: STAGES.SHORTLISTED, taskIds: ['task-3'] },
    [STAGES.INTERVIEW_SCHEDULED]: { id: STAGES.INTERVIEW_SCHEDULED, title: STAGES.INTERVIEW_SCHEDULED, taskIds: [] },
    [STAGES.OFFERED]: { id: STAGES.OFFERED, title: STAGES.OFFERED, taskIds: [] },
    [STAGES.REJECTED]: { id: STAGES.REJECTED, title: STAGES.REJECTED, taskIds: [] },
  },
  columnOrder: [STAGES.APPLIED, STAGES.REVIEWED, STAGES.SHORTLISTED, STAGES.INTERVIEW_SCHEDULED, STAGES.OFFERED, STAGES.REJECTED],
};

export default function RecruiterApplicantsPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const queryClient = useQueryClient();

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    // Moving to one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Applicant Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track candidate progress.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

              return (
                <div key={column.id} className="w-80 flex-shrink-0 flex flex-col max-h-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white dark:bg-slate-950 font-mono text-xs">{tasks.length}</Badge>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <ScrollArea className="flex-1 relative">
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/80 dark:bg-slate-800/80' : ''}`}
                        >
                          {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Card className={`mb-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''}`}>
                                    <div className="p-3 text-sm">{task.content}</div>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </ScrollArea>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
