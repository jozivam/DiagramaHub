# OCR nativo do Windows (Windows.Media.Ocr) sobre uma imagem PNG.
# Uso: powershell -File scripts/winocr.ps1 <imagem.png>
# Saída: JSON com linhas e palavras { t, x, y, w, h } em pixels.
param([Parameter(Mandatory=$true)][string]$ImagePath)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]
function Await($op, [Type]$t) {
  $task = $asTaskGeneric.MakeGenericMethod($t).Invoke($null, @($op))
  $task.Wait() | Out-Null
  $task.Result
}

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $ImagePath).Path)) ([Windows.Storage.StorageFile])
$stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new('en-US')) }
$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

$words = foreach ($line in $result.Lines) {
  foreach ($w in $line.Words) {
    [pscustomobject]@{ t = $w.Text; l = $line.Text; x = [int]$w.BoundingRect.X; y = [int]$w.BoundingRect.Y; w = [int]$w.BoundingRect.Width; h = [int]$w.BoundingRect.Height }
  }
}
[pscustomobject]@{ lang = $engine.RecognizerLanguage.LanguageTag; max = [Windows.Media.Ocr.OcrEngine]::MaxImageDimension; words = @($words) } | ConvertTo-Json -Depth 4 -Compress
$stream.Dispose()
