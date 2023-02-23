import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase";

function App() {
  const [name, setName] = useState<string>(""); // specify the type of the state variable name as string
  const [data, setData] = useState<any[]>([]); // specify the type of the state variable data as an array of any type
  const [editName, setEditName] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchNames();
  }, [data]);

  async function fetchNames() {
    let { data: names, error } = await supabase.from("users").select("*");
    if (error) console.log("error", error);
    else setData(names);
  }

  async function addName() {
    let { data: newData, error } = await supabase
      .from("users")
      .insert([{ name }]);
    if (error) console.log("error", error);
    else {
      setData((data) => [...data, ...(newData ?? [])]); // add the newly added data to the existing data
      setName("");
    }
  }

  async function editNameById(id: number, updatedName: string) {
    let { error } = await supabase
      .from("users")
      .update({ name: updatedName })
      .eq("id", id);
    if (error) console.log("error", error);
    else {
      fetchNames(); // refetch the data to update the UI
      setEditingId(null);
      setEditName("");
    }
  }

  async function deleteNameById(id: number) {
    setDeleteId(id);
    let { error } = await supabase.from("users").delete().eq("id", id);
    if (error) console.log("error", error);
    else {
      fetchNames();
      setDeleteId(0);
    }
  }

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="app">
      <div>
        <label htmlFor="name">Add new name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addName}>Submit</button>
      </div>
      <ul>
        {data.map((name, index) => (
          <li key={index}>
            <span>{name.name}</span>
            {deleteId === name.id ? (
              <div className="name-delete">
                <div style={{ color: "white" }}>
                  Are you sure you want to delete this name?
                </div>
                <div>
                  <button onClick={() => deleteNameById(name.id)}>Yes</button>
                  <button onClick={() => setDeleteId(null)}>No</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <button onClick={() => setEditingId(name.id)}>Edit</button>
                  <button onClick={() => setDeleteId(name.id)}>Delete</button>
                </div>
              </>
            )}
            {editingId === name.id && (
              <div className="name-edit">
                <label style={{ color: "white" }} htmlFor="edit">
                  Edit name
                </label>
                <input
                  name="edit"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <div>
                  <button onClick={() => editNameById(name.id, editName)}>
                    Save
                  </button>
                  <button onClick={() => cancelEdit()}>Cancel</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
