<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class Hello extends Controller
{
	public function index() {
		return 'hello world from controller : )';
	}

	public function show($name) {
		return view('hello',array('name' => $name));
	}
}