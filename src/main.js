import { html, render } from "lit-html";
import { component, useState, useEffect } from "@pionjs/pion";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const CocktailSearch = component(() => {
  const [query, setQuery] = useState("margarita");
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState({});

  const showToast = (message, type = "success") => {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "bottom",
      position: "right bottom",
      backgroundColor:
        type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#333",
      stopOnFocus: true,
    }).showToast();
  };

  // fetch cocktails by query
  const fetchCocktails = () => {
    if (!query) return;
    setLoading(true);
    fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        query
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setDrinks(data.drinks || []);
        setLoading(false);
        showToast(`Here are the results.`);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  // fetch on initial mount
  useEffect(() => {
    fetchCocktails();
    showToast(`Searching...`);
  }, []);

  // helper to extract non-null ingredients with measure
  const getIngredients = (drink) => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ing = drink[`strIngredient${i}`];
      const meas = drink[`strMeasure${i}`];
      if (ing) {
        ingredients.push(`${meas ? meas : ""}${ing}`);
      }
    }
    return ingredients;
  };

  // Add to the list of drinks
  const addToList = (drink) => {
    setLists((prev) => ({
      ...prev,
      [drink.strDrink]: drink,
    }));
    showToast(`Ingredients added to shopping list.`);
  };

  // print all added list
  const printList = () => {
    if (!lists || Object.keys(lists).length === 0) {
      showToast("Add items first! Nothing to print.", "error");
      return;
    }

    window.print();
  };

  // Remove list before we print
  const removeList = (name) => {
    setLists((prev) => {
      const newEntries = Object.entries(prev).filter(([key]) => key !== name);
      return Object.fromEntries(newEntries);
    });

    showToast("Ingredient removed from shopping list.", "error");
  };

  return html`
    <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
            background-color: #ffffff;
            }

            h1, h2, h3, h4, p {
            color: #333 !important;
            font-family: sans-serif !important; 
            }

            #shopping-list {
              width: 30%;
              height: 40rem;
            }

            @media print {
              body * {
                visibility: hidden;
              }
              #shopping-list,
              #shopping-list * {
                visibility: visible;
              }
              #shopping-list {
                position: absolute;
                top: 0;
                left: 0;
                width: 100% !important;
                height: auto !important;
                    overflow: visible !important;

              }
              #shopping-list div {
                display: flex;
                align-items: center;
                flex-direction: column;
                min-height: 90vh;
                height: auto !important;
                border: none !important;
                overflow: visible !important;
                box-shadow: none !important;
        }

              #shop-list {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-top: 1rem;
              }

              .print-button,
        .remove-button,
        input,
        button,
        img,
        ul[style*="flex-direction:column"] {
          display: none !important;
        }
      }
            }
    </style>

    <div
      style="padding: 1rem; display:flex; align-items:center; justify-content:center; flex-direction:column;"
    >
      <div style="width:100%; height: 100%;">
        <h2>Cocktail Search</h2>

        <div style="display:flex; align-items:center; justify-content:center">
          <input
            type="text"
            placeholder="Cocktail name..."
            .value=${query}
            @input=${(e) => setQuery(e.target.value)}
            autofocus="autofocus"
            style="padding: 0.5rem; font-size: 1rem; width: 100%; max-width: 300px; outline:none; margin-bottom:1rem;border:none; border-bottom: 1px solid #333"
          />
          <button
            @click=${() => {
              setDrinks([]);
              fetchCocktails();
            }}
            type="submit"
            style="margin-left: 0.5rem; cursor: pointer; background-color: transparent; border:none; font-weight:bold "
          >
            SEARCH
          </button>
        </div>
        <div style="display:flex; gap:10px; width:90%; margin: 1rem auto;">
          ${
            loading
              ? showToast(`Please wait..`)
              : drinks.length === 0
              ? showToast(`No results found.`, "error")
              : html`
                  <ul
                    style="display:flex; flex-direction:column; width: 100%; gap:10px;"
                  >
                    ${drinks.map(
                      (drink) => html`
                        <li
                          style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px; display:flex; height:100%; border: 1px solid #333; padding:5px; border-radius: 10px; background-color: #f6f6f6"
                        >
                          <div style="display:flex; flex:1; gap:5px">
                            <img
                              src="${drink.strDrinkThumb}"
                              alt="${drink.strDrink}"
                              style="width: 150px; border-radius: 8px;"
                            />
                            <div
                              style="display:flex; flex-direction:column; justify-content:center"
                            >
                              <h3>${drink.strDrink}</h3>
                              <p style="font-size: 0.8rem">
                                ${drink.strInstructions}
                              </p>
                            </div>
                          </div>
                          <div
                            style="height:100%; display:flex; align-items:end"
                          >
                            <button
                              style="border:none;background-color: transparent; font-size:2rem; cursor:pointer;"
                              @click=${() => addToList(drink)}
                            >
                              +
                            </button>
                          </div>
                        </li>
                      `
                    )}
                  </ul>
                `
          }
                <div
                  id="shopping-list"
                  style=" padding:5px; height:100vh position: relative"
                >
                  <div
                    style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px; border-radius: 10px; padding: 1rem; height: 30rem; overflow-y:auto; position: sticky; top:0; border: 1px solid #333; background-color: #f6f6f6"
                  >
                    <h3 style="text-align:center">
                      Shopping List & Ingredients
                    </h3>
                    <ul id="shop-list" style="margin-top:0.5rem">
                      ${Object.keys(lists).map((name) => {
                        const drink = lists[name];
                        const ingredients = getIngredients(drink);
                        return html`
                          <li
                            style="list-style-type:none; margin-bottom: 1rem; position: relative;"
                          >
                            <strong>${name}</strong>
                            <ul style="margin-left: 1rem; font-size: 0.9rem;">
                              ${ingredients.map(
                                (ing) =>
                                  html`<li style="list-style-type: none;">
                                    - ${ing}
                                  </li>`
                              )}
                            </ul>
                            <button
                              class="remove-button"
                              @click=${() => removeList(name)}
                              style="color: red;border:none;background-color: transparent; cursor:pointer; position:absolute; top: 0 ;right: 0"
                            >
                              Remove
                            </button>
                          </li>
                        `;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
         
        </div>
      </div>
    </div>
    <button
      class="print-button"
      @click=${printList}
      style="position:fixed; top: 1%; right: 1%; margin-top: 1rem; padding: 0.5rem 1rem; cursor:pointer; border-radius: 5px; border: 1px solid #333; background:white;"
    >
      🖨️ Print List
    </button>
  `;
});

customElements.define("cocktail-search", CocktailSearch);

render(
  html`<cocktail-search></cocktail-search>`,
  document.getElementById("app")
);
