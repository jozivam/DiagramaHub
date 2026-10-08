# OCR nativo do Windows em lote: processa todos os PNG de uma pasta e grava <nome>.json ao lado.
# Uso: powershell -File scripts/winocr_batch.ps1 <pasta>
param([Parameter(Mandatory=$true)][string]$Dir)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]
function Await($op, [Type]$t) {
  $task = $asTaskGeneric.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait() | Out-Null; $task.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

foreach ($img in Get-ChildItem -Path $Dir -Filter *.png) {
  $success = $false
  for ($retry = 0; $retry -lt 3 -and -not $success; $retry++) {
    try {
      if ($retry -gt 0) { Start-Sleep -Milliseconds 100 }
      $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($img.FullName)) ([Windows.Storage.StorageFile])
      $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
      $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
      $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
      $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
      $lines = foreach ($line in $result.Lines) {
        [pscustomobject]@{
          l = $line.Text
          words = @(foreach ($w in $line.Words) { [pscustomobject]@{ t = $w.Text; x = [int]$w.BoundingRect.X; y = [int]$w.BoundingRect.Y; w = [int]$w.BoundingRect.Width; h = [int]$w.BoundingRect.Height } })
        }
      }
      $json = (@($lines) | ConvertTo-Json -Depth 5 -Compress)
      if (-not $json) { $json = '[]' }
      [System.IO.File]::WriteAllText(($img.FullName -replace '\.png$', '.json'), $json, [System.Text.UTF8Encoding]::new($false))
      $bitmap.Dispose(); $stream.Dispose()
      $success = $true
    } catch {
      if ($retry -ge 2) {
        [System.IO.File]::WriteAllText(($img.FullName -replace '\.png$', '.json'), '[]', [System.Text.UTF8Encoding]::new($false))
      }
    }
  }
}
