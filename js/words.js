"use strict";

let form = document.getElementById("word-form");
let input = document.getElementById("word-input");
let sorted = document.getElementById("sorted");
let field = document.getElementById("field");
let output = document.getElementById("word-output");

function randomColor() {
  return "hsl(" + Math.floor(Math.random() * 360) + " 65% 78%)";
}

function sortWords(text) {
  let lower = [];
  let upper = [];
  let numbers = [];
  for (let part of text.split(/[-–—]/)) {
    let word = part.trim();
    if (!word) continue;
    if (/^\d+(?:[.,]\d+)?$/.test(word)) {
      numbers.push(word);
    } else if (word[0].toUpperCase() === word[0] && word[0].toLowerCase() !== word[0]) {
      upper.push(word);
    } else {
      lower.push(word);
    }
  }

  lower.sort((a, b) => a.localeCompare(b, "ru"));
  upper.sort((a, b) => a.localeCompare(b, "ru"));
  numbers.sort((a, b) => Number(a.replace(",", ".")) - Number(b.replace(",", ".")));

  let words = {};
  for (let [prefix, group] of [["a", lower], ["b", upper], ["n", numbers]]) {
    for (let i = 0; i < group.length; i++) {
      words[prefix + (i + 1)] = group[i];
    }
  }
  return words;
}

function inside(event, area) {
  let rect = area.getBoundingClientRect();
  return event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function makeChip(key, word, index, originalColor) {
  let chip = document.createElement("button");
  chip.type = "button";
  chip.className = "word-chip";
  chip.textContent = key + " " + word;
  chip.dataset.index = index;
  chip.style.backgroundColor = originalColor;

  let drag;
  let moved = false;

  chip.onpointerdown = function(event) {
    if (event.button !== 0 || drag) return;
    let rect = chip.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      style: chip.style.cssText
    };
    moved = false;
    chip.setPointerCapture(event.pointerId);
  };

  chip.onpointermove = function(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (!moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
    moved = true;
    chip.classList.add("dragging");
    chip.style.position = "fixed";
    chip.style.width = drag.width + "px";
    chip.style.left = event.clientX - drag.offsetX + "px";
    chip.style.top = event.clientY - drag.offsetY + "px";
  };

  chip.onpointerup = function(event) {
    if (!drag || event.pointerId !== drag.id) return;
    chip.classList.remove("dragging");
    chip.style.cssText = drag.style;

    if (moved && inside(event, field)) {
      if (chip.parentElement !== field) {
        field.appendChild(chip);
        chip.style.backgroundColor = randomColor();
      }
      chip.style.position = "absolute";
      let rect = field.getBoundingClientRect();
      let left = event.clientX - rect.left - field.clientLeft - drag.offsetX;
      let top = event.clientY - rect.top - field.clientTop - drag.offsetY;
      chip.style.left = Math.max(0, Math.min(left, field.clientWidth - chip.offsetWidth)) + "px";
      chip.style.top = Math.max(0, Math.min(top, field.clientHeight - chip.offsetHeight)) + "px";
    } else if (moved && inside(event, sorted)) {
      chip.style.cssText = "";
      chip.style.backgroundColor = originalColor;
      let next = Array.from(sorted.children).find(item => Number(item.dataset.index) > index);
      sorted.insertBefore(chip, next || null);
    }
    drag = null;
  };

  chip.onpointercancel = function(event) {
    if (!drag || event.pointerId !== drag.id) return;
    chip.classList.remove("dragging");
    chip.style.cssText = drag.style;
    drag = null;
  };

  chip.onclick = function(event) {
    if ((moved && event.detail !== 0) || chip.parentElement !== field) return;
    let span = document.createElement("span");
    span.textContent = word;
    span.style.backgroundColor = chip.style.backgroundColor;
    if (output.childNodes.length) output.append(" ");
    output.appendChild(span);
  };

  return chip;
}

form.onsubmit = function(event) {
  event.preventDefault();
  sorted.textContent = "";
  field.textContent = "";
  output.textContent = "";

  let words = sortWords(input.value);
  let color = randomColor();
  let index = 0;
  for (let key in words) {
    sorted.appendChild(makeChip(key, words[key], index, color));
    index++;
  }
};
