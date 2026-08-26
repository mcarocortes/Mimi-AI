# Generates square browser/PWA icons from logo_transp.png
# without stretching: the mark is letterboxed (object-contain) inside the canvas.

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $root 'src\assets\logo_transp.png'
$outDir = Join-Path $root 'public'
$src = [System.Drawing.Image]::FromFile($srcPath)

function Save-ContainedIcon {
  param(
    [int]$Size,
    [string]$OutFile,
    [double]$PadRatio = 0.08,
    [System.Drawing.Color]$Background
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear($Background)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $pad = [int]($Size * $PadRatio)
  $avail = $Size - (2 * $pad)
  $scale = [Math]::Min($avail / $src.Width, $avail / $src.Height)
  $w = [int][Math]::Round($src.Width * $scale)
  $h = [int][Math]::Round($src.Height * $scale)
  $x = [int][Math]::Round(($Size - $w) / 2)
  $y = [int][Math]::Round(($Size - $h) / 2)
  $g.DrawImage($src, $x, $y, $w, $h)

  $path = Join-Path $outDir $OutFile
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Output "wrote $OutFile ($Size`x$Size, contain $($w)x$h)"
}

$transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
$black = [System.Drawing.Color]::FromArgb(255, 0, 0, 0)

# Favicon: transparent so the non-square hood keeps its silhouette in the tab
Save-ContainedIcon -Size 32 -OutFile 'favicon-32.png' -PadRatio 0.06 -Background $transparent
Save-ContainedIcon -Size 48 -OutFile 'favicon.png' -PadRatio 0.06 -Background $transparent
Save-ContainedIcon -Size 180 -OutFile 'apple-touch-icon.png' -PadRatio 0.1 -Background $black
Save-ContainedIcon -Size 192 -OutFile 'pwa-192.png' -PadRatio 0.1 -Background $black
Save-ContainedIcon -Size 512 -OutFile 'pwa-512.png' -PadRatio 0.12 -Background $black

$src.Dispose()
