<?php
$ch = curl_init('http://127.0.0.1:8000/api/classes/1/threads?sort=latest');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json', 'Authorization: Bearer 15|zOmQsXhWNIyvN6d2k6jKMEJ5WfGv5oN3XFDlgSO53b15d7ae']);
$start = microtime(true);
$response = curl_exec($ch);
$end = microtime(true);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Time: " . ($end - $start) . "s\n";
echo "HTTP Status: $httpcode\n";
echo "Response: " . substr($response, 0, 100) . "\n";
