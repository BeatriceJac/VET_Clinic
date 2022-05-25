class Animal {

    constructor(n, t, w, id) {
        this.name = n;
        this.type = t;
        this.weight = w;
        this.id = typeof id == 'undefined' ? this.getId() : id;
    }

    getId() {
        let id = localStorage.getItem('vetId');
        if (id === null) {
            localStorage.setItem('vetId', 1);
            return 1;
        }
        id = parseInt(id);
        id++;
        localStorage.setItem('vetId', id);
        return id;
    }
}


class Storage {

    constructor(k) {
        this.key = k;
        this.data = this.read();
    }

    read() {
        let data = localStorage.getItem(this.key);
        if (data === null) {
            localStorage.setItem(this.key, JSON.stringify([]));//sukuria tuscia masyva ir ji grazina, todde this.data yra tuscias masyvas 
            return [];
        }
        return JSON.parse(data);
    }

    write() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    create(obj) {
        this.data.unshift(obj); //ideta zemiau sukurta animal objeta i bendra kaupykla
        this.write();
    }

    delete(id) {
        this.data.forEach((animal, i) => {
            if (animal.id == id) {
                this.data.splice(i, 1);
            }
        });
        this.write();
    }

    edit(obj) {
        this.data.forEach(animal => {
            if (animal.id == obj.id) {
                animal.name = obj.name;
                animal.type = obj.type;
                animal.weight = obj.weight;
            }
        });
        this.write();
    }

}


const storage = new Storage('vetData'); //kai daeiname iki sios eilutes yra paleidziamas Storage konstruktorius.
//ir jis paleidzia viduje esancius metodus.

const elements = { //cia susirandam visus elementus is html
    newAnimalName: document.querySelector('#new-animal-name'),
    newAnimalType: document.querySelector('#new-animal-type'),
    newAnimalWeight: document.querySelector('#new-animal-weight'),
    newAnimal: document.querySelector('#new-animal'), //prideti augintini
    editAnimal: document.querySelector('#edit-animal'),
    animalsList: document.querySelector('#animals-list'),
    editAnimalName: document.querySelector('#edit-animal-name'),
    editAnimalType: document.querySelector('#edit-animal-type'),
    editAnimalWeight: document.querySelector('#edit-animal-weight'),
};

//funkcija pasileida pridedant gyvuna.
elements.newAnimal.addEventListener('click', () => { 
    const animal = new Animal( //sukuria nauja animal objekta paduodamas jam tris reiksmes is pradines Animal klases:
        elements.newAnimalName.value,
        elements.newAnimalType.value,
        elements.newAnimalWeight.value,
    );
    storage.create(animal); //sukurta gyvuna perduodame objektu create i storage
    renderList();
});


const renderList = () => { 

    const ul = document.createElement('ul');
    ul.classList.add('list-group'); // prideda klase

    storage.data.forEach(animal => { // pereina per visa masyva
        const li = document.createElement('li');
        li.classList.add('list-group-item');

        const div1 = document.createElement('div');
        div1.classList.add('content');

        //cia igauna vizuala  ir appendinamas:
        const h6 = document.createElement('h6');
        h6.appendChild(document.createTextNode(animal.name || 'no name'));
        div1.appendChild(h6);
        const span = document.createElement('span');
        if (animal.type == 'c') {
            span.classList.add('cat');
        } else {
            span.classList.add('dog');
        }
        div1.appendChild(span);
        const i = document.createElement('i');
        i.appendChild(document.createTextNode((animal.weight || 0) + ' kg'));
        div1.appendChild(i);
        li.appendChild(div1);

        const div2 = document.createElement('div');
        div2.classList.add('buttons');

        const buttonEdit = document.createElement('button');
        buttonEdit.classList.add('btn', 'btn-outline-success', 'my-2', 'my-sm-0', 'm-1');
        buttonEdit.appendChild(document.createTextNode('Redaguoti'));
        div2.appendChild(buttonEdit);
        buttonEdit.addEventListener('click', () => {
            showModal(animal);
        });


        const buttonDel = document.createElement('button');
        buttonDel.classList.add('btn', 'btn-outline-danger', 'my-2', 'my-sm-0', 'm-1');
        buttonDel.appendChild(document.createTextNode('Trinti'));
        div2.appendChild(buttonDel);
        buttonDel.addEventListener('click', () => {
            storage.delete(animal.id); //issitrinam
            renderList();//is naujo surenderinam lista
        });



        li.appendChild(div2);
        ul.appendChild(li);
    });
    //is esmes kai pridedame nauja augintini, tai kodas viska istrina ir supushina is naujo.
    elements.animalsList.innerHTML = '';
    elements.animalsList.appendChild(ul);
}

let modalId = 0; // modalas - issokantis redagavimo langas
//editinimas modale
const showModal = (animal) => {
    const modal = document.querySelector('.modal');
    modal.classList.add('show');
    modal.style.display = 'block'; // susitvarko su sintakes, kad islistu modal ir pasirodytu
    //laukelius auto supildo is Animal gautos reiksmes.
    elements.editAnimalName.value = animal.name;
    elements.editAnimalType.value = animal.type;
    elements.editAnimalWeight.value = animal.weight;
    modalId = animal.id; // updateinamas tuo ID, kuris siuo metu rodomas, pries tai tiesiog 0.
}

const hideModal = () => {
    const modal = document.querySelector('.modal');
    modal.classList.remove('show');
    modal.style.display = 'none'; //susitvarko su html
    elements.editAnimalName.value = '';//visas reiksmes panaikina
    elements.editAnimalType.value = '';
    elements.editAnimalWeight.value = '';
    modalId = 0;//grazina ID i nuli.
}

document.querySelectorAll('[data-dismiss=modal]').forEach(b => {
    b.addEventListener('click', () => {
        hideModal();
    });
});

//pasiredaguoja atidarius modal1
elements.editAnimal.addEventListener('click', () => {
    const animal = new Animal(
        elements.editAnimalName.value,
        elements.editAnimalType.value,
        elements.editAnimalWeight.value,
        modalId
    );
    storage.edit(animal); //susipushina i storage
    hideModal();//uzdaro modala
    renderList(); //renderina lista
})

renderList(); // issaukia render funkcija, kuri yra virsuje
//su pirmu paleidimu susikuria tik tuscias masyva (per Storage) ir per renderi jis tik pasilleidzia nieko daug nedarydamas, nes pradzioje neturime supildytos jokios info
