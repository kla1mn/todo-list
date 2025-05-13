function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag)

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key])
    })
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child))
      } else if (child instanceof HTMLElement) {
        element.appendChild(child)
      }
    })
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children))
  }

  if (callbacks) {
    Object.keys(callbacks).forEach((event) => {
      element.addEventListener(event, callbacks[event])
    })
  }

  return element
}

class Component {
  constructor(props) {
    this.props = props || {}
  }

  getDomNode() {
    this._domNode = this.render()
    return this._domNode
  }

  update() {
    const newDomNode = this.render()
    this._domNode.replaceWith(newDomNode)
    this._domNode = newDomNode
  }
}

class Task extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deleteConfirmation: false,
    }
  }

  onDelete = () => {
    if (this.state.deleteConfirmation) {
      this.props.onDelete(this.props.id)
    } else {
      this.state.deleteConfirmation = true
      this.update()
    }
  }

  onToggle = () => {
    this.props.onToggle(this.props.id)
  }

  render() {
    return createElement("li", {}, [
      (() => {
        const checkbox = createElement("input", { type: "checkbox" }, null, {
          change: this.onToggle,
        })
        checkbox.checked = this.props.completed
        return checkbox
      })(),
      createElement("label", { style: this.props.completed ? "color: gray;" : "" }, this.props.text),
      createElement("button", { style: this.state.deleteConfirmation ? "background-color: red;" : "" }, "🗑️", {
        click: this.onDelete,
      }),
    ])
  }
}

class AddTask extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
    }
  }

  onInputChange = (e) => {
    this.state.inputValue = e.target.value
  }

  onAddTask = () => {
    if (this.state.inputValue.trim()) {
      this.props.onAddTask(this.state.inputValue)
      document.getElementById("new-todo").value = ""
      this.state.inputValue = ""
    }
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement(
          "input",
          {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
          },
          null,
          { input: this.onInputChange },
      ),
      createElement("button", { id: "add-btn" }, "+", { click: this.onAddTask }),
    ])
  }
}

class TodoList extends Component {
  constructor() {
    super()
    const savedTasks = localStorage.getItem("tasks")
    this.state = {
      tasks: savedTasks
          ? JSON.parse(savedTasks)
          : [
            { id: 1, text: "Сделать домашку", completed: false },
            { id: 2, text: "Сделать практику", completed: false },
            { id: 3, text: "Пойти домой", completed: false },
          ],
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.state.tasks))
  }

  onAddTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
    }
    this.state.tasks.push(newTask)
    this.saveToLocalStorage()
    this.update()
  }

  onToggleTask = (id) => {
    const task = this.state.tasks.find((task) => task.id === id)
    if (task) {
      task.completed = !task.completed
      this.saveToLocalStorage()
      this.update()
    }
  }

  onDeleteTask = (id) => {
    this.state.tasks = this.state.tasks.filter((task) => task.id !== id)
    this.saveToLocalStorage()
    this.update()
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask({ onAddTask: this.onAddTask }).getDomNode(),
      createElement(
          "ul",
          { id: "todos" },
          this.state.tasks.map((task) =>
              new Task({
                id: task.id,
                text: task.text,
                completed: task.completed,
                onDelete: this.onDeleteTask,
                onToggle: this.onToggleTask,
              }).getDomNode(),
          ),
      ),
    ])
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode())
})
