import { Component } from '@angular/core';

import { CouchService } from '../shared/couchdb.service';
import { Router } from '@angular/router';

require('./login.scss');

@Component({
    template: `
        <div class="ole-login">
            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                <div>
                    <label>Username</label><input [(ngModel)]="model.name" placeholder="Enter username" name="name" />
                </div>
                <div>
                    <label>Password</label><input [(ngModel)]="model.password" placeholder="Password" name="password" />
                </div>
                <div *ngIf="createMode">
                    <label>Repeat Password</label><input [(ngModel)]="model.repeatPassword" placeholder="Repeat Password" name="repeatPassword" />
                </div>
                <div>
                    <a [routerLink]="createMode ? ['/login'] : ['newuser']">{{ createMode ? 'Already have an account?' : 'Are you new?' }}</a>
                    <button class="ole-btn cursor-pointer">{{ createMode ? 'Create User' : 'Login' }}</button>
                </div>
            </form>
        </div>
        <div id="login-status">{{message}}</div>
    `
})
export class LoginComponent { 
    constructor(
        private couchService: CouchService,
        private router: Router
    ) {}
    
    createMode:boolean = this.router.url.split('?')[0] === '/login/newuser';
    model = { name:'', password:'', repeatPassword:'' }
    message = '';
    
    onSubmit() {
        if(this.createMode) {
            this.createUser(this.model);
        } else {
            this.login(this.model);
        }
    }
    
    reRoute() {
        this.router.navigate(['/'], {});
    }
    
    createUser({name,password,repeatPassword}:{name:string,password:string,repeatPassword:string}) {
        if(password === repeatPassword) {
            this.couchService.put('_users/org.couchdb.user:' + name, {'name': name, 'password': password, 'roles': [], 'type': 'user'})
                .then((data) => {
                    this.message = 'User created: ' + data.id.replace('org.couchdb.user:','');
                    this.reRoute();
                }, (error) => this.message = '');
        } else {
            this.message = 'Passwords do not match';
        }
    }
    
    login({name,password}:{name:string,password:string}) {
        this.couchService.post('_session', {'name':name, 'password':password}, { withCredentials:true })
            .then((data) => { 
                this.message = 'Hi, ' + data.name + '!';
                this.reRoute();
            },(error) => this.message = 'Username and/or password do not match');
    }
}