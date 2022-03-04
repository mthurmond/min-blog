console.log('hi world');

// when button clicked, change display of p to block and of button to none

// 1- add click event listener to button
// 2- when click event happens
//  -  chng display of button to none
//  -  chng display of paragraph to block

function showHint() {
    console.log('function ran');
    const hintButton = document.getElementById('button-hint');
    hintButton.setAttribute('style', 'display: none;'); 

    const hintParagraph = document.getElementById('hint');
    hintParagraph.setAttribute('style', 'display: block;'); 
}