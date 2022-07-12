# Vue Cleanup

### Taylor Plewe, July 2022

Checks the Vue file you're working on for stylistic mistakes and inconsistencies with good style practice.

Data updates every time you save the .vue file OR whenever you switch between files.

Checks for unused:
- data members
- computed properties
- methods
- variables
- CSS classes defined in <code>&lt;style&gt;</code> section

<!-- end of list -->

Checks for miscellaneous syntactic things:

|   | finds | should be |
| :------------ | :------------ | :------------ |
| no spaces inside of curly braces | {{value}} | {{ value }} |
| camel case properties | :isShowing; &lt;acoModal&gt; | :is-showing; &lt;aco-modal&gt; |
| explicitly setting prop of component to true | :is-showing="true" | is-showing |
| double quotes for strings | "my dad is a computer" | 'my dad is a computer' |
| double equals | this.numColumns == null | this.numColumns === null |

I'm working on checking for more things like this. ↑

Also lists all comments, TODOs and console.log's in the file at a glance.

### To-do
- `x` button on each item in the extension's panel that saves that item to an ignore list
- button on each item/group that will automatically fix the things they're pointing out; as of right now it only shows the problems to you and you can click on them and it will take you to them.
- check for clean organized ordering of component props & events e.g.
 1. regular props
 1. v-bind props
 1. events
- better organization of the `Misc` view
- more that I can't think of right now