# Task Manager Application

## Project Overview

This project demonstrates:

* DOM Manipulation
* Event Handling
* Event Delegation
* Event Bubbling
* Event Capturing
* Attributes vs Properties
* Browser Rendering Pipeline

---

# Parsing

Parsing is the process where the browser reads HTML code and understands its structure.

---

# Tokenization

Tokenization converts HTML text into meaningful tokens such as:

* Opening tags
* Closing tags
* Attributes
* Text nodes

Example:

```html
<h1>Hello</h1>
```

Tokens:

* h1 opening tag
* text Hello
* h1 closing tag

---

# DOM Tree

DOM (Document Object Model) is a tree-like structure generated from HTML.

Example:

```text
html
 └─ body
     └─ h1
```

JavaScript uses the DOM to manipulate elements.

---

# CSSOM Tree

The browser parses CSS and creates the CSS Object Model (CSSOM).

It contains all styles applied to the page.

---

# Render Tree

The browser combines:

DOM Tree
+
CSSOM Tree

to create the Render Tree.

The Render Tree is used for painting pixels on the screen.

---

# Event Bubbling

Event starts from the target element and moves upward.

Example:

Child
→ Parent
→ Grandparent

---

# Event Capturing

Event starts from the outermost element and moves inward.

Example:

Grandparent
→ Parent
→ Child

---

# Event Delegation

Instead of adding event listeners to every button individually, one listener is attached to the parent container.

Benefits:

* Better performance
* Less memory usage
* Works with dynamically added elements

---

# Features

* Add Task
* Edit Task
* Delete Task
* Complete Task
* Search Task
* Category Filter
* Theme Toggle
* Local Storage
* Event Delegation
* Event Bubbling
* Event Capturing
* Browser Rendering Pipeline Visualization

---

# Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript

---

# Author

Vedant Wadekar

```
```
