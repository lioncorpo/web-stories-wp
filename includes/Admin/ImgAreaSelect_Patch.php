<?php
/**
 * Class ImgAreaSelect_Patch.
 *
 * @package   Google\Web_Stories
 * @copyright 2020 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/google/web-stories-wp
 */

/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories\Admin;

use Google\Web_Stories\Assets;
use Google\Web_Stories\Infrastructure\Conditional;
use Google\Web_Stories\Infrastructure\Registerable;
use Google\Web_Stories\Infrastructure\Service;
use Google\Web_Stories\Traits\Screen;

/**
 * Class ImgAreaSelect_Patch
 *
 * @package Google\Web_Stories
 */
class ImgAreaSelect_Patch implements Conditional, Service, Registerable {
	use Screen;

	/**
	 * Web Stories editor script handle.
	 *
	 * @var string
	 */
	const SCRIPT_HANDLE = 'imgareaselect';

	/**
	 * Assets instance.
	 *
	 * @var Assets Assets instance.
	 */
	private $assets;

	/**
	 * Crop Script constructor.
	 *
	 * @since 1.10.0
	 *
	 * @param Assets $assets Assets instance.
	 */
	public function __construct( Assets $assets ) {
		$this->assets = $assets;
	}

	/**
	 * Check whether the conditional object is currently needed.
	 *
	 * @since 1.10.0
	 *
	 * @return bool Whether the conditional object is needed.
	 */
	public static function is_needed(): bool {
		// TODO, make this service condtional on WordPress version once core is fixed.
		return is_admin() && ! wp_doing_ajax();
	}

	/**
	 * Runs on instantiation.
	 *
	 * @since 1.10.0
	 *
	 * @return void
	 */
	public function register() {
		add_filter( 'script_loader_tag', [ $this, 'script_loader_tag' ], 10, 3 );
	}

	/**
	 * Filters the HTML script tag of an enqueued script.
	 *
	 * @since 1.10.0
	 *
	 * @param string $tag    The `<script>` tag for the enqueued script.
	 * @param string $handle The script's registered handle.
	 * @param string $src    The script's source URL.
	 *
	 * @return string
	 */
	public function script_loader_tag( $tag, $handle, $src ) {
		if ( self::SCRIPT_HANDLE !== $handle || ! $this->is_edit_screen() ) {
			return $tag;
		}
		$asset   = $this->assets->get_asset_metadata( $handle );
		$new_src = $this->assets->get_base_url( "assets/js/{$handle}.js" );
		$new_src = add_query_arg(
			[ 'ver' => $asset['version'] ],
			$new_src
		);

		return str_replace( $src, $new_src, $tag );
	}
}
