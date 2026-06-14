<?php
$u = App\Models\User::where('email', 'zakiimaalik@gmail.com')->first();
foreach ($u->classes as $c) {
    echo $c->id . " - " . $c->name . "\n";
}
