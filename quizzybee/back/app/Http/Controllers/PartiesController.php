<?php

namespace App\Http\Controllers;

use App\Models\Party;
use Illuminate\Http\Request;

class PartiesController extends Controller
{
    /**
     * Display a listing of the parties.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $parties = Party::all();
        return response()->json($parties);
    }

    /**
     * Store a newly created party in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $party = Party::create($request->all());
        return response()->json($party);
    }

    /**
     * Display the specified party.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $party = Party::find($id);
        if ($party) {
            return response()->json($party);
        } else {
            return response()->json(["status" => "error"]);
        }
    }

    /**
     * Update the specified party in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $party = Party::find($id);
        if ($party) {
            $party->update($request->all());
            return response()->json($party);
        } else {
            return response()->json(['id not found']);
        }
    }

    /**
     * Remove the specified party from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $party = Party::find($id);
        if ($party) {
            $party->delete();
            return response()->json(['status' => 'success']);
        } else {
            return response()->json(['id not found']);
        }
    }
}
