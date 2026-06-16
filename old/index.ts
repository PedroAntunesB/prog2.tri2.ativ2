import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    title TEXT NOT NULL
  )
`);

const querySelectItems = db.prepare("SELECT * FROM items");
const queryInsertItem = db.prepare("INSERT INTO items (title) VALUES (?)");
const queryDeleteItem = db.prepare("DELETE FROM items WHERE id = (?);");
const queryUpdateItem = db.prepare(
  "UPDATE items SET title = (?) WHERE id = (?)",
);

class Item {
  private _id: number;
  constructor(
    public title: string,
    id?: number,
  ) {
    if (id) {
      this._id = id;
    } else {
      const item_number = queryInsertItem.run(this.title).lastInsertRowid;
      this._id = item_number as number;
    }
  }
  updateItem(newTitle: string) {
    queryUpdateItem.run(newTitle, this._id);
    this.title = newTitle;
  }

  deleteItem() {
    queryDeleteItem.run(this._id);
    this._id = NaN;
    this.title = "";
  }

  getId() {
    return this._id;
  }
}

class TodoList {
  private items: Item[] = querySelectItems
    .all()
    .map((i: any) => new Item(i.title, i.id));

  getItems() {
    return this.items;
  }

  addItem(item: Item) {
    this.items.push(item);
  }

  removeItems(id: number) {
    const index = this.items.findIndex((i) => i.getId() === id);

    if (index !== -1) {
      this.items[index]?.deleteItem();
      this.items.splice(index, 1);
    }
  }

  updateItems(id: number, newTitle: string) {
    this.items.forEach((i) => {
      if (i.getId() == id) {
        i.updateItem(newTitle);
        i.title = newTitle;
      }
    });
  }
}

const lista = new TodoList();
lista.addItem(new Item("fazer o 67"));
lista.addItem(new Item("farmar aura"));
lista.addItem(new Item("aprender typescript"));
lista.removeItems(1);
lista.updateItems(3, "moggar betas");
console.table(lista.getItems());