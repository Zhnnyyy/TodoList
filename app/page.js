"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => (
  <nav className="bg-primary text-primary-foreground p-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      <UserButton />
    </div>
  </nav>
);

const TaskModal = ({ task, onClose, onSave, uid }) => {
  const [title, setTitle] = useState(task ? task.title : "");
  const [deadline, setDeadline] = useState(
    task ? new Date(task.deadline) : null
  );
  const addTask = useMutation(api.Task.AddTask);
  const handleSave = async () => {
    if (task) {
      if (validation()) {
        onSave({
          title: title,
          deadline: deadline.toLocaleDateString(),
          taskID: task._id,
        });
        setTitle("");
        setDeadline("");
        onClose();
      }
      return;
    }

    if (!validation()) {
      return;
    }
    const result = await addTask({
      title: title,
      clerkID: uid,
      deadline: deadline.toLocaleDateString(),
      status: false,
    });
    if (result) {
      setTitle("");
      setDeadline("");
      onClose();
    }
  };

  const validation = () => {
    if (!title || !deadline.toLocaleDateString()) {
      alert("Please fill in all fields");
      return false;
    }
    return true;
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogDescription>
          {task
            ? "Edit your task here. Click save when you are done"
            : "Add a new task to your list. Click save when you are done"}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="deadline" className="text-right">
            Deadline
          </Label>
          <div className="col-span-3">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleSave}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const Dashboard = (props) => {
  const [tasks, setTasks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const fetchTask = useQuery(api.Task.Task, { clerkID: props.uid });

  useEffect(() => {
    if (fetchTask) setTasks(fetchTask);
  }, [fetchTask]);

  return (
    <div className="container mx-auto mt-8 pl-[10%] pr-[10%]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Tasks</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <TaskModal onClose={() => setIsAddModalOpen(false)} uid={props.uid} />
        </Dialog>
      </div>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskItem object={task} key={task._id} onOpen={setIsAddModalOpen} />
        ))}
      </div>
    </div>
  );
};

const TaskItem = ({ object }) => {
  const [editingTask, setEditingTask] = useState();
  const updateTaskInfo = useMutation(api.Task.updateTaskInfo);
  const deleeTask = useMutation(api.Task.deleteTask);
  const updateStatus = useMutation(api.Task.updateStatus);
  const handleUpdateTask = async (obj) => {
    if (obj) {
      await updateTaskInfo(obj);
    }
  };

  const handleDeleteTask = async () => {
    const propmt = confirm("Are you sure you want to delete this task?");
    if (propmt) {
      await deleeTask({ taskID: object._id });
    }
  };

  const handleChange = async (e) => {
    const newval = e.target.checked;
    await updateStatus({ taskID: object._id, status: newval });
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow flex justify-between items-center">
      <div className="flex gap-5 items-center">
        <input
          type="checkbox"
          value={object.status}
          className="w-5 h-5"
          onChange={handleChange}
        />
        <div>
          <h3 className="text-lg  font-semibold">
            {object.status ? <del>{object.title}</del> : object.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Deadline:{" "}
            {object.status ? (
              <del>{format(object.deadline, "PPP")}</del>
            ) : (
              format(object.deadline, "PPP")
            )}
          </p>
        </div>
      </div>
      <div className="space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setEditingTask(object)}>
              Edit
            </Button>
          </DialogTrigger>
          {editingTask && (
            <TaskModal
              task={editingTask}
              onClose={() => setEditingTask(null)}
              onSave={handleUpdateTask}
            />
          )}
        </Dialog>
        <Button variant="destructive" onClick={handleDeleteTask}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default function Component() {
  const user = useQuery(api.User.currentUser);
  const [userID, setUserID] = useState();

  useEffect(() => {
    if (user) setUserID(user?.tokenIdentifier.split("|")[1]);
  }, [user]);
  return (
    <div className="min-h-screen bg-background">
      {user && (
        <>
          <Navbar />
          <Dashboard uid={userID} />
        </>
      )}
    </div>
  );
}
