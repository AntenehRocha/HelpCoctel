$(document).ready(function () {
  const API_BASE = "https://www.thecocktaildb.com/api/json/v1/1";

  // ─── Theme Toggle ────────────────────────────────────────────────
  $("#themeToggle").on("click", function () {
    const html = $("html");
    const isDark = html.attr("data-theme") === "dark";
    html.attr("data-theme", isDark ? "light" : "dark");
    $(this)
      .find(".theme-icon")
      .text(isDark ? "☾" : "☀");
  });

  // ─── Helpers ─────────────────────────────────────────────────────
  function getIngredients(drink) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ing = drink["strIngredient" + i];
      const measure = drink["strMeasure" + i];
      if (ing && ing.trim()) {
        ingredients.push({
          name: ing.trim(),
          measure: measure ? measure.trim() : "",
        });
      }
    }
    return ingredients;
  }

  function getCategoryClass(category) {
    const map = {
      Cocktail: "badge-cocktail",
      Shot: "badge-shot",
      "Ordinary Drink": "badge-ordinary",
      "Punch / Party Drink": "badge-punch",
      "Coffee / Tea": "badge-coffee",
      Beer: "badge-beer",
    };
    return map[category] || "badge-default";
  }

  // ─── Build Card HTML via jQuery ───────────────────────────────────
  function buildCard(drink) {
    const ingredients = getIngredients(drink);
    const preview = ingredients
      .slice(0, 3)
      .map(function (i) {
        return i.name;
      })
      .join(", ");
    const more = ingredients.length > 3 ? " +" + (ingredients.length - 3) : "";

    const $card = $("<article>")
      .addClass("cocktail-card")
      .attr("data-id", drink.idDrink);

    const $imgWrap = $("<div>").addClass("card-img-wrap");
    const $img = $("<img>")
      .addClass("card-img")
      .attr("src", drink.strDrinkThumb + "/preview")
      .attr("alt", drink.strDrink)
      .attr("loading", "lazy");
    const $overlay = $("<div>").addClass("card-img-overlay");
    const $viewBtn = $("<button>").addClass("card-view-btn").text("Ver receta");
    $overlay.append($viewBtn);
    $imgWrap.append($img, $overlay);

    const $body = $("<div>").addClass("card-body");

    const $badgeRow = $("<div>").addClass("card-badge-row");
    const $badge = $("<span>")
      .addClass("card-badge")
      .addClass(getCategoryClass(drink.strCategory))
      .text(drink.strCategory || "Cóctel");
    const $alc = $("<span>")
      .addClass("card-alcoholic")
      .text(
        drink.strAlcoholic === "Alcoholic" ? "🍸 Alcohólico" : "🥤 Sin alcohol",
      );
    $badgeRow.append($badge, $alc);

    const $name = $("<h4>").addClass("card-name").text(drink.strDrink);
    const $glass = $("<p>")
      .addClass("card-glass")
      .html('<span class="glass-icon">⌾</span> ' + (drink.strGlass || ""));
    const $ings = $("<p>")
      .addClass("card-ingredients")
      .text(preview + more);

    $body.append($badgeRow, $name, $glass, $ings);
    $card.append($imgWrap, $body);
    return $card;
  }

  // ─── Build Modal via jQuery ──────────────────────────────────────
  function buildModal(drink) {
    const ingredients = getIngredients(drink);
    const $layout = $("<div>").addClass("modal-layout");

    const $left = $("<div>").addClass("modal-left");
    const $img = $("<img>")
      .addClass("modal-img")
      .attr("src", drink.strDrinkThumb)
      .attr("alt", drink.strDrink);
    const $glass = $("<p>")
      .addClass("modal-glass-tag")
      .html("🥃 " + (drink.strGlass || ""));
    $left.append($img, $glass);

    const $right = $("<div>").addClass("modal-right");
    const $badgeRow = $("<div>").addClass("modal-badge-row");
    const $badge = $("<span>")
      .addClass("card-badge")
      .addClass(getCategoryClass(drink.strCategory))
      .text(drink.strCategory || "Cóctel");
    const $alc = $("<span>")
      .addClass("card-alcoholic")
      .text(
        drink.strAlcoholic === "Alcoholic" ? "🍸 Alcohólico" : "🥤 Sin alcohol",
      );
    $badgeRow.append($badge, $alc);

    const $name = $("<h2>").addClass("modal-name").text(drink.strDrink);

    const $ingsTitle = $("<h5>")
      .addClass("modal-section-title")
      .text("Ingredientes");
    const $ingList = $("<ul>").addClass("modal-ingredients");
    ingredients.forEach(function (ing) {
      const $li = $("<li>").addClass("modal-ingredient");
      const $dot = $("<span>").addClass("ingredient-dot");
      const $ingName = $("<span>").addClass("ingredient-name").text(ing.name);
      const $measure = $("<span>")
        .addClass("ingredient-measure")
        .text(ing.measure);
      $li.append($dot, $ingName, $measure);
      $ingList.append($li);
    });

    const $instrTitle = $("<h5>")
      .addClass("modal-section-title")
      .text("Preparación");
    const $instr = $("<p>")
      .addClass("modal-instructions")
      .text(drink.strInstructions || "Sin instrucciones disponibles.");

    $right.append($badgeRow, $name, $ingsTitle, $ingList, $instrTitle, $instr);
    $layout.append($left, $right);
    return $layout;
  }

  // ─── Open / Close Modal ──────────────────────────────────────────
  function openModal(drinkId) {
    $("#modalContent").html(
      $("<div>")
        .addClass("modal-loading")
        .append($("<span>").addClass("spinner")),
    );
    $("#modalOverlay").addClass("active");
    $("body").addClass("no-scroll");

    $.getJSON(API_BASE + "/lookup.php?i=" + drinkId, function (data) {
      const drink = data.drinks[0];
      $("#modalContent").empty().append(buildModal(drink));
    });
  }

  $("#modalClose").on("click", function () {
    $("#modalOverlay").removeClass("active");
    $("body").removeClass("no-scroll");
  });

  $("#modalOverlay").on("click", function (e) {
    if ($(e.target).is("#modalOverlay")) {
      $("#modalOverlay").removeClass("active");
      $("body").removeClass("no-scroll");
    }
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $("#modalOverlay").removeClass("active");
      $("body").removeClass("no-scroll");
    }
  });

  // Card click → modal
  $(document).on("click", ".cocktail-card", function () {
    openModal($(this).attr("data-id"));
  });
  $(document).on("click", ".card-view-btn", function (e) {
    e.stopPropagation();
    openModal($(this).closest(".cocktail-card").attr("data-id"));
  });

  // ─── Skeletons ───────────────────────────────────────────────────
  function showSkeletons(count) {
    const $grid = $("#cardsContainer");
    $grid.empty();
    for (let i = 0; i < count; i++) {
      const $sk = $("<div>").addClass("skeleton-card");
      $sk.append($("<div>").addClass("skeleton-img"));
      const $sb = $("<div>").addClass("skeleton-body");
      $sb.append($("<div>").addClass("skeleton-line skeleton-short"));
      $sb.append($("<div>").addClass("skeleton-line"));
      $sb.append($("<div>").addClass("skeleton-line skeleton-mid"));
      $sk.append($sb);
      $grid.append($sk);
    }
  }

  // ─── Render cards ────────────────────────────────────────────────
  function renderCards(drinks) {
    const $grid = $("#cardsContainer");
    $grid.empty();
    drinks.forEach(function (drink, i) {
      const $card = buildCard(drink).css("animation-delay", i * 70 + "ms");
      $grid.append($card);
    });
  }

  function setSectionHeader(eyebrow, title) {
    $(".section-eyebrow").text(eyebrow);
    $(".section-title").text(title);
  }

  // ─── Load 8 random cocktails ─────────────────────────────────────
  // iOS Safari agresivamente cachea GETs a la misma URL.
  // Solución: cache-busting con timestamp único por petición + $.ajax cache:false
  function loadRandom() {
    setSectionHeader("Para inspirarte", "Cócteles del momento");
    showSkeletons(8);

    const promises = [];
    for (let i = 0; i < 8; i++) {
      promises.push(
        $.ajax({
          url: API_BASE + "/random.php",
          dataType: "json",
          cache: false, // jQuery añade _=timestamp automático
          data: { _r: Date.now() + "_" + i }, // param extra por si acaso
        }),
      );
    }

    $.when.apply($, promises).done(function () {
      // Con 1 petición, arguments = [data, status, xhr]
      // Con N peticiones, arguments = [[data,status,xhr], [data,status,xhr], ...]
      const results = Array.from(arguments);
      const drinks = results.map(function (r) {
        // Si es array de [data, statusText, xhr] → r[0].drinks[0]
        // Si es el data directamente (1 sola petición) → r.drinks[0]
        const data = Array.isArray(r) ? r[0] : r;
        return data.drinks[0];
      });
      // Deduplica por si la API devuelve el mismo cóctel dos veces
      const seen = new Set();
      const unique = drinks.filter(function (d) {
        if (seen.has(d.idDrink)) return false;
        seen.add(d.idDrink);
        return true;
      });
      renderCards(unique);
    });
  }

  // ─── Search ──────────────────────────────────────────────────────
  function doSearch(query) {
    if (!query.trim()) return;
    setSectionHeader("Resultados para", '"' + query + '"');
    showSkeletons(6);
    $("#searchSuggestions").empty().removeClass("visible");
    $("html, body").animate(
      { scrollTop: $("#mainSection").offset().top - 80 },
      500,
    );

    $.getJSON(
      API_BASE + "/search.php?s=" + encodeURIComponent(query),
      function (data) {
        if (data.drinks) {
          renderCards(data.drinks);
        } else {
          const $noResult = $("<div>").addClass("no-results");
          $noResult.append($("<p>").addClass("no-results-emoji").text("🍹"));
          $noResult.append(
            $("<p>").addClass("no-results-title").text("No encontramos nada"),
          );
          $noResult.append(
            $("<p>")
              .addClass("no-results-sub")
              .text('Intenta con otro nombre, como "Margarita" o "Gin Tonic"'),
          );
          $("#cardsContainer").html($noResult);
        }
      },
    );
  }

  $("#searchBtn").on("click", function () {
    doSearch($("#searchInput").val());
  });
  $("#searchInput").on("keydown", function (e) {
    if (e.key === "Enter") doSearch($(this).val());
  });

  // ─── Live suggestions ────────────────────────────────────────────
  let suggestTimer;
  $("#searchInput").on("input", function () {
    clearTimeout(suggestTimer);
    const val = $(this).val().trim();
    const $sug = $("#searchSuggestions");
    if (val.length < 2) {
      $sug.empty().removeClass("visible");
      return;
    }

    suggestTimer = setTimeout(function () {
      $.getJSON(
        API_BASE + "/search.php?s=" + encodeURIComponent(val),
        function (data) {
          $sug.empty();
          if (data.drinks) {
            data.drinks.slice(0, 5).forEach(function (drink) {
              const $item = $("<div>").addClass("suggestion-item");
              $item.append(
                $("<img>")
                  .addClass("suggestion-img")
                  .attr("src", drink.strDrinkThumb + "/preview")
                  .attr("alt", ""),
              );
              $item.append(
                $("<span>").addClass("suggestion-name").text(drink.strDrink),
              );
              $item.append(
                $("<span>").addClass("suggestion-cat").text(drink.strCategory),
              );
              $item.on("click", function () {
                $("#searchInput").val(drink.strDrink);
                doSearch(drink.strDrink);
              });
              $sug.append($item);
            });
            $sug.addClass("visible");
          } else {
            $sug.removeClass("visible");
          }
        },
      );
    }, 350);
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".search-bar, #searchSuggestions").length) {
      $("#searchSuggestions").removeClass("visible");
    }
  });

  // ─── Refresh button ──────────────────────────────────────────────
  $("#refreshBtn").on("click", function () {
    $("#searchInput").val("");
    loadRandom();
  });

  // ─── Init ────────────────────────────────────────────────────────
  loadRandom();
});
